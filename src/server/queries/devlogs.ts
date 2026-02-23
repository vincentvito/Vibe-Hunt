import { supabase } from "@/server/db";

export async function getGameDevlogs(gameId: string) {
  const { data, error } = await supabase
    .from("devlogs")
    .select(
      `
      id, title, body, created_at,
      users!user_id ( display_name, username, avatar_url )
    `
    )
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGameDevlogs error:", error.message);
    return [];
  }

  return (data ?? []).map((d: any) => ({
    id: d.id,
    title: d.title,
    body: d.body,
    createdAt: d.created_at,
    authorName: d.users?.display_name ?? "Unknown",
    authorUsername: d.users?.username ?? "unknown",
    authorAvatar: d.users?.avatar_url ?? null,
  }));
}
