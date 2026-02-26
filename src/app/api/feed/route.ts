import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";
import { getFeed, getUserUpvotedGameIds } from "@/server/queries/games";
import type { FeedSort, FeedResponse } from "@/types/feed";

const VALID_SORTS: FeedSort[] = ["hot", "new", "top"];

export async function GET(request: NextRequest) {
  const rawSort = request.nextUrl.searchParams.get("sort") ?? "hot";
  const sort: FeedSort = VALID_SORTS.includes(rawSort as FeedSort)
    ? (rawSort as FeedSort)
    : "hot";

  const games = await getFeed(sort);

  let upvotedIds: string[] = [];
  try {
    const supabaseAuth = await createServerClient();
    const {
      data: { user: authUser },
    } = await supabaseAuth.auth.getUser();
    if (authUser) {
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authUser.id)
        .limit(1)
        .maybeSingle();
      if (user) {
        const upvotedSet = await getUserUpvotedGameIds(
          user.id,
          games.map((g) => g.id)
        );
        upvotedIds = Array.from(upvotedSet);
      }
    }
  } catch {
    // Auth failure is non-critical for feed
  }

  const response: FeedResponse = {
    games: games.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      tagline: g.tagline,
      engine: g.engine,
      thumbnailUrl: g.thumbnailUrl,
      webBuildUrl: g.webBuildUrl,
      madeWithAi: g.madeWithAi,
      upvoteCount: g.upvoteCount,
      commentCount: g.commentCount,
      playCount: g.playCount,
      creatorName: g.creatorName,
      creatorUsername: g.creatorUsername,
      creatorAvatar: g.creatorAvatar,
    })),
    upvotedIds,
  };

  return NextResponse.json(response);
}
