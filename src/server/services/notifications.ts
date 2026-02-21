import { supabase } from "@/server/db";
import { nanoid } from "nanoid";

type NotificationType =
  | "upvote"
  | "comment"
  | "comment_reply"
  | "new_follower"
  | "offer_received"
  | "offer_accepted"
  | "offer_rejected"
  | "escrow_released"
  | "bounty_bid"
  | "bounty_accepted"
  | "daily_featured"
  | "remix_created";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      id: nanoid(),
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      is_read: false,
      metadata: input.metadata ?? null,
    });
  } catch {
    console.error("Failed to create notification:", input.type);
  }
}
