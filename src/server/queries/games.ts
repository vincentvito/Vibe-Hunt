import { supabase } from "@/server/db";

export type FeedSort = "hot" | "new" | "top";

export async function getFeed(sort: FeedSort = "hot") {
  try {
    const { data, error } = await supabase.rpc("get_hot_feed", {
      sort_mode: sort,
      result_limit: 50,
    });

    if (error) {
      console.error("getFeed error:", error.message);
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
      coverImageUrl: g.cover_image_url,
      webBuildUrl: g.web_build_url,
      madeWithAi: g.made_with_ai,
      aiToolsUsed: g.ai_tools_used ?? [],
      upvoteCount: g.upvote_count,
      commentCount: g.comment_count,
      playCount: g.play_count,
      launchDate: g.launch_date,
      publishedAt: g.published_at,
      creatorId: g.creator_id,
      creatorName: g.creator_display_name ?? "Unknown",
      creatorUsername: g.creator_username ?? "unknown",
      creatorAvatar: g.creator_avatar_url ?? null,
    }));
  } catch (err) {
    console.error("getFeed unexpected error:", err);
    return [];
  }
}

export async function getTodaysFeed() {
  try {
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        id, slug, title, tagline, engine, thumbnail_url, cover_image_url,
        web_build_url, made_with_ai, ai_tools_used, upvote_count,
        comment_count, play_count, launch_date, published_at, creator_id,
        users!creator_id ( display_name, username, avatar_url )
      `
      )
      .eq("status", "published")
      .order("upvote_count", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("getTodaysFeed error:", error.message);
      return [];
    }
    if (!data) return [];

    return data.map((g: any) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      tagline: g.tagline,
      engine: g.engine,
      thumbnailUrl: g.thumbnail_url,
      coverImageUrl: g.cover_image_url,
      webBuildUrl: g.web_build_url,
      madeWithAi: g.made_with_ai,
      aiToolsUsed: g.ai_tools_used ?? [],
      upvoteCount: g.upvote_count,
      commentCount: g.comment_count,
      playCount: g.play_count,
      launchDate: g.launch_date,
      publishedAt: g.published_at,
      creatorId: g.creator_id,
      creatorName: g.users?.display_name ?? "Unknown",
      creatorUsername: g.users?.username ?? "unknown",
      creatorAvatar: g.users?.avatar_url ?? null,
    }));
  } catch (err) {
    console.error("getTodaysFeed unexpected error:", err);
    return [];
  }
}

export async function getGameBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        id, slug, title, tagline, description, engine, status,
        web_build_url, thumbnail_url, cover_image_url, video_url,
        website_url, source_code_url, made_with_ai, ai_tools_used,
        upvote_count, comment_count, play_count, launch_date,
        published_at, created_at, creator_id,
        users!creator_id ( display_name, username, avatar_url, twitter_url, instagram_url )
      `
      )
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("getGameBySlug error:", error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      tagline: data.tagline,
      description: data.description,
      engine: data.engine,
      status: data.status,
      webBuildUrl: data.web_build_url,
      thumbnailUrl: data.thumbnail_url,
      coverImageUrl: data.cover_image_url,
      videoUrl: data.video_url,
      websiteUrl: data.website_url,
      sourceCodeUrl: data.source_code_url,
      madeWithAi: data.made_with_ai,
      aiToolsUsed: data.ai_tools_used ?? [],
      upvoteCount: data.upvote_count,
      commentCount: data.comment_count,
      playCount: data.play_count,
      launchDate: data.launch_date,
      publishedAt: data.published_at,
      createdAt: data.created_at,
      creatorId: data.creator_id,
      creatorName: (data as any).users?.display_name ?? "Unknown",
      creatorUsername: (data as any).users?.username ?? "unknown",
      creatorAvatar: (data as any).users?.avatar_url ?? null,
      creatorTwitterUrl: (data as any).users?.twitter_url ?? null,
      creatorInstagramUrl: (data as any).users?.instagram_url ?? null,
    };
  } catch (err) {
    console.error("getGameBySlug unexpected error:", err);
    return null;
  }
}

export async function hasUserUpvoted(userId: string, gameId: string) {
  const { data } = await supabase
    .from("upvotes")
    .select("id")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function getUserUpvotedGameIds(
  userId: string,
  gameIds: string[]
): Promise<Set<string>> {
  if (gameIds.length === 0) return new Set();

  const { data } = await supabase
    .from("upvotes")
    .select("game_id")
    .eq("user_id", userId)
    .in("game_id", gameIds);

  return new Set((data ?? []).map((u: any) => u.game_id));
}

export async function getGamesByCreator(creatorId: string) {
  const { data } = await supabase
    .from("games")
    .select(
      "id, slug, title, tagline, status, thumbnail_url, upvote_count, play_count, published_at, created_at"
    )
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((g: any) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    status: g.status,
    thumbnailUrl: g.thumbnail_url,
    upvoteCount: g.upvote_count,
    playCount: g.play_count,
    publishedAt: g.published_at,
    createdAt: g.created_at,
  }));
}
