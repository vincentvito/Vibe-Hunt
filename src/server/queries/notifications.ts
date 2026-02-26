import { supabase } from "@/server/db";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export async function getNotifications(
  userId: string,
  limit = 20,
  offset = 0
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, is_read, metadata, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    isRead: n.is_read,
    metadata: n.metadata as Record<string, unknown> | null,
    createdAt: n.created_at,
  }));
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}
