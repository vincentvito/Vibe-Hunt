import { supabase } from "@/server/db";

type FeedRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  engine: string;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  web_build_url: string | null;
  made_with_ai: boolean;
  ai_tools_used: string[] | null;
  upvote_count: number;
  comment_count: number;
  play_count: number;
  launch_date: string | null;
  published_at: string;
  creator_id: string;
  creator_display_name?: string;
  creator_username?: string;
  creator_avatar_url?: string | null;
  users?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    twitter_url?: string | null;
    instagram_url?: string | null;
  } | null;
};

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

    return (data as FeedRow[]).map((g) => ({
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

    type TodayRow = (typeof data)[number] & {
      users?: { display_name: string; username: string; avatar_url: string | null } | null;
    };
    return (data as TodayRow[]).map((g) => ({
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

export async function getGameBySlug(
  slug: string,
  opts?: { allowAnyStatus?: boolean }
) {
  try {
    let query = supabase
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
      .eq("slug", slug);

    if (!opts?.allowAnyStatus) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.limit(1).maybeSingle();

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
      creatorName: (data as unknown as FeedRow).users?.display_name ?? "Unknown",
      creatorUsername: (data as unknown as FeedRow).users?.username ?? "unknown",
      creatorAvatar: (data as unknown as FeedRow).users?.avatar_url ?? null,
      creatorTwitterUrl: (data as unknown as FeedRow).users?.twitter_url ?? null,
      creatorInstagramUrl: (data as unknown as FeedRow).users?.instagram_url ?? null,
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

  return new Set((data ?? []).map((u) => u.game_id));
}

export async function getGamesByCreator(creatorId: string) {
  const { data } = await supabase
    .from("games")
    .select(
      "id, slug, title, tagline, status, thumbnail_url, upvote_count, play_count, published_at, created_at"
    )
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((g) => ({
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
