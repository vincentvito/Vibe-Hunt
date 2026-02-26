import { supabase } from "@/server/db";

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function getGamesByTag(tagSlug: string) {
  const { data: tag } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", tagSlug)
    .maybeSingle();

  if (!tag) return [];

  const { data: gameTagRows } = await supabase
    .from("game_tags")
    .select("game_id")
    .eq("tag_id", tag.id);

  if (!gameTagRows || gameTagRows.length === 0) return [];

  const gameIds = gameTagRows.map((gt) => gt.game_id);

  const { data: games } = await supabase
    .from("games")
    .select(
      `
      id, slug, title, tagline, engine, thumbnail_url,
      web_build_url, made_with_ai, upvote_count,
      comment_count, play_count,
      users!creator_id ( display_name, username, avatar_url )
    `
    )
    .eq("status", "published")
    .in("id", gameIds)
    .order("upvote_count", { ascending: false });

  if (!games) return [];

  type GameWithUser = (typeof games)[number] & {
    users?: { display_name: string; username: string; avatar_url: string | null } | null;
  };
  return (games as GameWithUser[]).map((g) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    engine: g.engine,
    thumbnailUrl: g.thumbnail_url,
    webBuildUrl: g.web_build_url,
    madeWithAi: g.made_with_ai,
    upvoteCount: g.upvote_count,
    commentCount: g.comment_count,
    playCount: g.play_count,
    creatorName: g.users?.display_name ?? "Unknown",
    creatorUsername: g.users?.username ?? "unknown",
    creatorAvatar: g.users?.avatar_url ?? null,
  }));
}
