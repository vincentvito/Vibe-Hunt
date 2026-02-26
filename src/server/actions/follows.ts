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
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function toggleFollow(
  targetUserId: string
): Promise<ActionResult<{ following: boolean }>> {
  try {
    const user = await requireAuth();

    if (user.id === targetUserId) {
      return actionError("You cannot follow yourself.");
    }

    const rl = await rateLimit(`follow:${user.id}`, {
      maxRequests: 20,
      windowMs: 60_000,
    });
    if (!rl.success)
      return actionError("Too many requests. Please slow down.");

    // Verify target user exists
    const { data: targetUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", targetUserId)
      .limit(1)
      .maybeSingle();
    if (!targetUser) {
      return actionError("User not found.");
    }

    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase.from("follows").delete().eq("id", existing[0].id);

      revalidatePath("/");
      return actionSuccess({ following: false });
    } else {
      await supabase.from("follows").insert({
        id: nanoid(),
        follower_id: user.id,
        following_id: targetUserId,
      });

      await createNotification({
        userId: targetUserId,
        type: "new_follower",
        title: `${user.display_name} started following you`,
        link: `/profile/${user.username}`,
        metadata: { followerId: user.id, followerUsername: user.username },
      });

      revalidatePath("/");
      return actionSuccess({ following: true });
    }
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return actionError("Failed to update follow. Please try again.");
  }
}
