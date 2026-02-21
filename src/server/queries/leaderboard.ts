import { supabase } from "@/server/db";

export type LeaderboardGame = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  engine: string;
  thumbnailUrl: string | null;
  madeWithAi: boolean;
  upvoteCount: number;
  commentCount: number;
  playCount: number;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string | null;
  rank: number;
};

export type LeaderboardCreator = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  gameCount: number;
  totalUpvotes: number;
  totalPlays: number;
  rank: number;
};

export type TimeRange = "today" | "week" | "month" | "alltime";

export async function getLeaderboard(
  range: TimeRange = "alltime",
  limit = 50
): Promise<LeaderboardGame[]> {
  let query = supabase
    .from("games")
    .select(
      `id, slug, title, tagline, engine, thumbnail_url, made_with_ai,
       upvote_count, comment_count, play_count, published_at,
       users!creator_id ( display_name, username, avatar_url )`
    )
    .eq("status", "published");

  if (range !== "alltime") {
    const now = new Date();
    let since: Date;
    switch (range) {
      case "today":
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        since = new Date(now.getTime() - 7 * 86400 * 1000);
        break;
      case "month":
        since = new Date(now.getTime() - 30 * 86400 * 1000);
        break;
    }
    query = query.gte("published_at", since!.toISOString());
  }

  const { data, error } = await query
    .order("upvote_count", { ascending: false })
    .order("play_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((g: any, index: number) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    tagline: g.tagline,
    engine: g.engine,
    thumbnailUrl: g.thumbnail_url,
    madeWithAi: g.made_with_ai,
    upvoteCount: g.upvote_count,
    commentCount: g.comment_count,
    playCount: g.play_count,
    creatorName: g.users?.display_name ?? "Unknown",
    creatorUsername: g.users?.username ?? "unknown",
    creatorAvatar: g.users?.avatar_url ?? null,
    rank: index + 1,
  }));
}

export async function getTopCreators(
  limit = 20
): Promise<LeaderboardCreator[]> {
  const { data, error } = await supabase
    .from("games")
    .select(
      `creator_id, upvote_count, play_count,
       users!creator_id ( id, display_name, username, avatar_url )`
    )
    .eq("status", "published");

  if (error || !data) return [];

  const creatorMap = new Map<
    string,
    {
      id: string;
      displayName: string;
      username: string;
      avatarUrl: string | null;
      gameCount: number;
      totalUpvotes: number;
      totalPlays: number;
    }
  >();

  for (const g of data as any[]) {
    const cid = g.creator_id;
    const existing = creatorMap.get(cid);
    if (existing) {
      existing.gameCount++;
      existing.totalUpvotes += g.upvote_count ?? 0;
      existing.totalPlays += g.play_count ?? 0;
    } else {
      creatorMap.set(cid, {
        id: cid,
        displayName: g.users?.display_name ?? "Unknown",
        username: g.users?.username ?? "unknown",
        avatarUrl: g.users?.avatar_url ?? null,
        gameCount: 1,
        totalUpvotes: g.upvote_count ?? 0,
        totalPlays: g.play_count ?? 0,
      });
    }
  }

  return Array.from(creatorMap.values())
    .sort((a, b) => b.totalUpvotes - a.totalUpvotes)
    .slice(0, limit)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}
