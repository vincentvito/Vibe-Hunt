import { Rocket } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";
import { getFeed, getUserUpvotedGameIds } from "@/server/queries/games";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CategoryBar } from "@/components/layout/category-bar";
import { GameFeedClient } from "@/components/feed/game-feed-client";
import type { FeedSort, FeedResponse } from "@/types/feed";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: rawSort } = await searchParams;
  const sort: FeedSort = (["hot", "new", "top"].includes(rawSort ?? "")
    ? rawSort
    : "hot") as FeedSort;

  // Server-fetch initial feed data
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
    // Auth failure is non-critical
  }

  const initialData: FeedResponse = {
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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {/* Hero */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Rocket className="h-4 w-4" />
              The Launchpad
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Discover Today&apos;s Best
              <span className="text-primary"> Vibecoded </span>
              Games
            </h1>
            <p className="mt-2 text-muted-foreground">
              {today} &mdash; Play instantly in your browser, upvote your
              favorites
            </p>
          </div>

          {/* Client-side feed with sort tabs */}
          <GameFeedClient initialSort={sort} initialData={initialData} />
        </div>
      </main>
      <CategoryBar />
      <Footer />
    </div>
  );
}
