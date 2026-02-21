import type { Metadata } from "next";
import {
  getLeaderboard,
  getTopCreators,
  type TimeRange,
} from "@/server/queries/leaderboard";
import { LeaderboardTabs } from "@/components/games/leaderboard-tabs";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top vibecoded games on VibeHunt",
};

type Props = {
  searchParams: Promise<{ range?: string }>;
};

export default async function LeaderboardPage({ searchParams }: Props) {
  const { range = "alltime" } = await searchParams;
  const validRange = ["today", "week", "month", "alltime"].includes(range)
    ? (range as TimeRange)
    : "alltime";

  const [games, creators] = await Promise.all([
    getLeaderboard(validRange),
    getTopCreators(10),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-muted-foreground">
        Top games ranked by upvotes, plays, and engagement
      </p>
      <LeaderboardTabs
        currentRange={validRange}
        games={games}
        creators={creators}
      />
    </div>
  );
}
