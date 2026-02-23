import { supabase } from "@/server/db";

export async function searchGames(query: string) {
  if (!query || query.trim().length === 0) return [];

  try {
    const { data, error } = await supabase.rpc("search_games", {
      search_query: query.trim(),
      result_limit: 20,
    });

    if (error) {
      console.error("searchGames error:", error.message);
      return [];
    }
    if (!data) return [];

    return (data as any[]).map((g) => ({
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
      publishedAt: g.published_at,
      creatorId: g.creator_id,
      creatorName: g.creator_display_name ?? "Unknown",
      creatorUsername: g.creator_username ?? "unknown",
      creatorAvatar: g.creator_avatar_url ?? null,
    }));
  } catch (err) {
    console.error("searchGames unexpected error:", err);
    return [];
  }
}
