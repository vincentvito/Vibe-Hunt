"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronUp, Gamepad2, Play, MessageSquare } from "lucide-react";
import { cn, formatCompactNumber } from "@/lib/utils";
import type {
  LeaderboardGame,
  LeaderboardCreator,
  TimeRange,
} from "@/server/queries/leaderboard";

const ranges: { label: string; value: TimeRange }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "alltime" },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return <span className="text-lg font-bold text-yellow-500">1st</span>;
  if (rank === 2)
    return <span className="text-lg font-bold text-gray-400">2nd</span>;
  if (rank === 3)
    return <span className="text-lg font-bold text-amber-700">3rd</span>;
  return (
    <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  );
}

export function LeaderboardTabs({
  currentRange,
  games,
  creators,
}: {
  currentRange: TimeRange;
  games: LeaderboardGame[];
  creators: LeaderboardCreator[];
}) {
  return (
    <div className="mt-6">
      {/* Time range tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {ranges.map((r) => (
          <Link
            key={r.value}
            href={`/leaderboard?range=${r.value}`}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
              currentRange === r.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Games leaderboard */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Gamepad2 className="h-5 w-5" />
          Top Games
        </h2>

        {games.length === 0 ? (
          <p className="mt-4 text-center text-muted-foreground">
            No games found for this time range.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="w-12 text-center">
                  <RankBadge rank={game.rank} />
                </div>

                {game.thumbnailUrl ? (
                  <Image
                    src={game.thumbnailUrl}
                    alt={game.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{game.title}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    by {game.creatorName}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ChevronUp className="h-4 w-4" />
                    {formatCompactNumber(game.upvoteCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" />
                    {formatCompactNumber(game.playCount)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {formatCompactNumber(game.commentCount)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Creators leaderboard */}
      <div className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ChevronUp className="h-5 w-5" />
          Top Creators
        </h2>

        {creators.length === 0 ? (
          <p className="mt-4 text-center text-muted-foreground">
            No creators found.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.username}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <div className="w-12 text-center">
                  <RankBadge rank={creator.rank} />
                </div>

                {creator.avatarUrl ? (
                  <Image
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium">{creator.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    @{creator.username}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{creator.gameCount} games</span>
                  <span className="flex items-center gap-1">
                    <ChevronUp className="h-4 w-4" />
                    {formatCompactNumber(creator.totalUpvotes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3.5 w-3.5" />
                    {formatCompactNumber(creator.totalPlays)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
