"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/server/db";
import { createCommentSchema } from "@/lib/validators";
import { nanoid } from "nanoid";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";
import { createNotification } from "@/server/services/notifications";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function createComment(input: {
  body: string;
  gameId: string;
  parentId?: string;
}): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = await rateLimit(`comment:${user.id}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });
    if (!rl.success)
      return actionError("Too many comments. Please wait a moment.");

    const validated = createCommentSchema.parse(input);

    // Verify game exists and is published
    const { data: targetGame } = await supabase
      .from("games")
      .select("id, status")
      .eq("id", validated.gameId)
      .limit(1)
      .maybeSingle();
    if (!targetGame) return actionError("Game not found.");
    if (targetGame.status !== "published")
      return actionError("Cannot comment on this game.");

    let depth = 0;
    if (validated.parentId) {
      const { data: parent } = await supabase
        .from("comments")
        .select("depth, game_id")
        .eq("id", validated.parentId)
        .eq("game_id", validated.gameId)
        .limit(1)
        .maybeSingle();
      if (!parent) {
        return actionError("Parent comment not found.");
      }
      if (parent.depth >= 3) {
        return actionError("Maximum reply depth reached.");
      }
      depth = parent.depth + 1;
    }

    await supabase.from("comments").insert({
      id: nanoid(),
      body: sanitizeText(validated.body),
      game_id: validated.gameId,
      user_id: user.id,
      parent_id: validated.parentId ?? null,
      depth,
    });

    const { error: rpcError } = await supabase.rpc("increment_comment", {
      game_id_input: validated.gameId,
    });
    if (rpcError) {
      console.error("Failed to increment comment count:", rpcError.message);
    }

    const { data: game } = await supabase
      .from("games")
      .select("creator_id, title, slug")
      .eq("id", validated.gameId)
      .limit(1)
      .maybeSingle();

    if (game && game.creator_id !== user.id) {
      await createNotification({
        userId: game.creator_id,
        type: "comment",
        title: `${user.display_name} commented on "${game.title}"`,
        body: validated.body.substring(0, 100),
        link: `/games/${game.slug}`,
        metadata: { gameId: validated.gameId, commenterId: user.id },
      });
    }

    if (validated.parentId) {
      const { data: parentComment } = await supabase
        .from("comments")
        .select("user_id")
        .eq("id", validated.parentId)
        .limit(1)
        .maybeSingle();

      if (parentComment && parentComment.user_id !== user.id) {
        await createNotification({
          userId: parentComment.user_id,
          type: "comment_reply",
          title: `${user.display_name} replied to your comment`,
          body: validated.body.substring(0, 100),
          link: game ? `/games/${game.slug}` : undefined,
          metadata: {
            parentCommentId: validated.parentId,
            replierId: user.id,
          },
        });
      }
    }

    revalidatePath("/");
    return actionSuccess(undefined);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return actionError("Failed to post comment. Please try again.");
  }
}

export async function deleteComment(
  commentId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const { data: comment } = await supabase
      .from("comments")
      .select("id, user_id, game_id")
      .eq("id", commentId)
      .limit(1)
      .maybeSingle();

    if (!comment) return actionError("Comment not found.");
    if (comment.user_id !== user.id)
      return actionError("You can only delete your own comments.");

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return actionError("Failed to delete comment. Please try again.");

    const { error: rpcError } = await supabase.rpc("decrement_comment", {
      game_id_input: comment.game_id,
    });
    if (rpcError) {
      console.error("Failed to decrement comment count:", rpcError.message);
    }

    revalidatePath("/");
    return actionSuccess(undefined);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return actionError("Failed to delete comment. Please try again.");
  }
}
