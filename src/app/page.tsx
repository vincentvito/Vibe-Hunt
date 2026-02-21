import { Suspense } from "react";
import Link from "next/link";
import { Gamepad2, Rocket, Trophy, Zap } from "lucide-react";
import { getTodaysFeed } from "@/server/queries/games";
import { GameCard } from "@/components/games/game-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CategoryBar } from "@/components/layout/category-bar";
import { GameCardListSkeleton } from "@/components/skeletons/game-card-skeleton";

export const dynamic = "force-dynamic";

export default function HomePage() {
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

          {/* Game Feed */}
          <Suspense fallback={<GameCardListSkeleton count={5} />}>
            <GameFeed />
          </Suspense>
        </div>
      </main>
      <CategoryBar />
      <Footer />
    </div>
  );
}

async function GameFeed() {
  const games = await getTodaysFeed();

  return (
    <>
      {/* Stats bar */}
      <div className="mb-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Gamepad2 className="h-4 w-4" />
          {games.length} games today
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
              />
            </div>
          </div>
        ))}

        {games.length === 0 && (
          <div className="py-16 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              No games yet today
            </h2>
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
      </div>
    </>
  );
}
