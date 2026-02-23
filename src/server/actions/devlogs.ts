"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/server/db";
import { createDevlogSchema } from "@/lib/validators";
import { nanoid } from "nanoid";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";

export async function createDevlog(input: {
  title: string;
  body: string;
  gameId: string;
}): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = await rateLimit(`devlog:${user.id}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!rl.success)
      return actionError("Too many posts. Please wait a moment.");

    const validated = createDevlogSchema.parse(input);

    // Verify user is the game creator
    const { data: game } = await supabase
      .from("games")
      .select("creator_id, slug")
      .eq("id", validated.gameId)
      .limit(1)
      .single();

    if (!game) return actionError("Game not found.");
    if (game.creator_id !== user.id)
      return actionError("Only the game creator can post devlogs.");

    const { error } = await supabase.from("devlogs").insert({
      id: nanoid(),
      title: sanitizeText(validated.title),
      body: sanitizeText(validated.body),
      game_id: validated.gameId,
      user_id: user.id,
    });

    if (error) {
      console.error("createDevlog error:", error.message);
      return actionError("Failed to post devlog. Please try again.");
    }

    revalidatePath(`/games/${game.slug}`);
    return actionSuccess(undefined);
  } catch {
    return actionError("Failed to post devlog. Please try again.");
  }
}
