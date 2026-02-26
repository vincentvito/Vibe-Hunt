"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Flame, Clock, Trophy, Gamepad2, Zap, Rocket } from "lucide-react";
import { GameCard } from "@/components/games/game-card";
import { GameCardListSkeleton } from "@/components/skeletons/game-card-skeleton";
import { cn } from "@/lib/utils";
import type { FeedSort, FeedResponse } from "@/types/feed";

const SORT_OPTIONS = [
  { value: "hot" as const, label: "Hot", icon: Flame },
  { value: "new" as const, label: "New", icon: Clock },
  { value: "top" as const, label: "Top", icon: Trophy },
];

async function fetchFeed(sort: FeedSort): Promise<FeedResponse> {
  const res = await fetch(`/api/feed?sort=${sort}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

type GameFeedClientProps = {
  initialSort: FeedSort;
  initialData: FeedResponse;
};

export function GameFeedClient({
  initialSort,
  initialData,
}: GameFeedClientProps) {
  const [sort, setSort] = useState<FeedSort>(initialSort);

  const { data, isLoading } = useQuery({
    queryKey: ["feed", sort],
    queryFn: () => fetchFeed(sort),
    initialData: sort === initialSort ? initialData : undefined,
    staleTime: 60 * 1000,
  });

  function handleSortChange(newSort: FeedSort) {
    setSort(newSort);
    window.history.replaceState(null, "", `/?sort=${newSort}`);
  }

  const games = data?.games ?? [];
  const upvotedIds = new Set(data?.upvotedIds ?? []);

  return (
    <>
      {/* Sort Toggle */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                sort === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Gamepad2 className="h-4 w-4" />
          {games.length} games
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-accent" />
          Play instantly
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4" />
          <Link href="/leaderboard" className="hover:text-foreground">
            Leaderboard
          </Link>
        </span>
      </div>

      {/* Game List */}
      {isLoading ? (
        <GameCardListSkeleton count={5} />
      ) : games.length > 0 ? (
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={game.id} className="flex items-center gap-3">
              <span className="w-6 text-right text-sm font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex-1">
                <GameCard
                  id={game.id}
                  slug={game.slug}
                  title={game.title}
                  tagline={game.tagline}
                  engine={game.engine}
                  thumbnailUrl={game.thumbnailUrl}
                  webBuildUrl={game.webBuildUrl}
                  madeWithAi={game.madeWithAi}
                  upvoteCount={game.upvoteCount}
                  commentCount={game.commentCount}
                  playCount={game.playCount}
                  creatorName={game.creatorName}
                  creatorUsername={game.creatorUsername}
                  creatorAvatar={game.creatorAvatar}
                  hasUpvoted={upvotedIds.has(game.id)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No games yet today</h2>
          <p className="mt-1 text-muted-foreground">
            Be the first to launch a game!
          </p>
          <Link
            href="/games/submit"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Rocket className="h-4 w-4" />
            Launch a Game
          </Link>
        </div>
      )}
    </>
  );
}
