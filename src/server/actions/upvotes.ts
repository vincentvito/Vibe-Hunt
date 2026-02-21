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

    const rl = rateLimit(`upvote:${user.id}`, {
      maxRequests: 30,
      windowMs: 60_000,
    });
    if (!rl.success) return actionError("Too many requests. Please slow down.");

    const { data: existing } = await supabase
      .from("upvotes")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", gameId)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("upvotes").delete().eq("id", existing[0].id);
      await supabase.rpc("decrement_upvote", { game_id_input: gameId });

      revalidatePath("/");
      return actionSuccess({ upvoted: false });
    } else {
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("upvotes").insert({
        id: nanoid(),
        user_id: user.id,
        game_id: gameId,
        date: today,
      });
      await supabase.rpc("increment_upvote", { game_id_input: gameId });

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
    }
  } catch {
    return actionError("Failed to toggle upvote. Please try again.");
  }
}
