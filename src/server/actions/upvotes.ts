"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/server/db";
import { nanoid } from "nanoid";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";
import { createNotification } from "@/server/services/notifications";

export async function toggleUpvote(
  gameId: string
): Promise<ActionResult<{ upvoted: boolean }>> {
  try {
    const user = await requireAuth();

    const rl = await rateLimit(`upvote:${user.id}`, {
      maxRequests: 30,
      windowMs: 60_000,
    });
    if (!rl.success) return actionError("Too many requests. Please slow down.");

    // Try to insert first — relies on unique constraint (user_id, game_id)
    const today = new Date().toISOString().split("T")[0];
    const { error: insertError } = await supabase.from("upvotes").insert({
      id: nanoid(),
      user_id: user.id,
      game_id: gameId,
      date: today,
    });

    if (insertError) {
      // Conflict means upvote already exists — remove it
      const { error: deleteError } = await supabase
        .from("upvotes")
        .delete()
        .eq("user_id", user.id)
        .eq("game_id", gameId);

      if (deleteError) {
        console.error("Failed to delete upvote:", deleteError.message);
        return actionError("Failed to toggle upvote. Please try again.");
      }

      const { error: rpcError } = await supabase.rpc("decrement_upvote", {
        game_id_input: gameId,
      });
      if (rpcError) {
        console.error("Failed to decrement upvote count:", rpcError.message);
      }

      revalidatePath("/");
      return actionSuccess({ upvoted: false });
    }

    // Insert succeeded — increment counter
    const { error: rpcError } = await supabase.rpc("increment_upvote", {
      game_id_input: gameId,
    });
    if (rpcError) {
      console.error("Failed to increment upvote count:", rpcError.message);
    }

    const { data: game } = await supabase
      .from("games")
      .select("creator_id, title, slug")
      .eq("id", gameId)
      .limit(1)
      .single();

    if (game && game.creator_id !== user.id) {
      await createNotification({
        userId: game.creator_id,
        type: "upvote",
        title: `${user.display_name} upvoted "${game.title}"`,
        link: `/games/${game.slug}`,
        metadata: { gameId, voterId: user.id },
      });
    }

    revalidatePath("/");
    return actionSuccess({ upvoted: true });
  } catch {
    return actionError("Failed to toggle upvote. Please try again.");
  }
}
