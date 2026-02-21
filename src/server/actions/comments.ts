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

export async function createComment(input: {
  body: string;
  gameId: string;
  parentId?: string;
}): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = rateLimit(`comment:${user.id}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });
    if (!rl.success)
      return actionError("Too many comments. Please wait a moment.");

    const validated = createCommentSchema.parse(input);

    let depth = 0;
    if (validated.parentId) {
      const { data: parent } = await supabase
        .from("comments")
        .select("depth")
        .eq("id", validated.parentId)
        .limit(1)
        .single();
      if (parent) {
        depth = Math.min(parent.depth + 1, 3);
      }
    }

    await supabase.from("comments").insert({
      id: nanoid(),
      body: sanitizeText(validated.body),
      game_id: validated.gameId,
      user_id: user.id,
      parent_id: validated.parentId ?? null,
      depth,
    });

    await supabase.rpc("increment_comment", {
      game_id_input: validated.gameId,
    });

    const { data: game } = await supabase
      .from("games")
      .select("creator_id, title, slug")
      .eq("id", validated.gameId)
      .limit(1)
      .single();

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
        .single();

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
  } catch {
    return actionError("Failed to post comment. Please try again.");
  }
}
