"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/server/db";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";

export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = rateLimit(`notif-read:${user.id}`, {
      maxRequests: 60,
      windowMs: 60_000,
    });
    if (!rl.success) return actionError("Too many requests.");

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    revalidatePath("/");
    return actionSuccess(undefined);
  } catch {
    return actionError("Failed to mark notification as read.");
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = rateLimit(`notif-read-all:${user.id}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!rl.success) return actionError("Too many requests.");

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    revalidatePath("/");
    return actionSuccess(undefined);
  } catch {
    return actionError("Failed to mark notifications as read.");
  }
}
