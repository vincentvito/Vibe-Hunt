import Link from "next/link";
import { Gamepad2, X } from "lucide-react";
import { getTodaysFeed } from "@/server/queries/games";
import { getGamesByTag, getAllTags } from "@/server/queries/tags";
import { GameCard } from "@/components/games/game-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Games",
  description: "Explore all vibecoded games on VibeHunt",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function BrowseGamesPage({ searchParams }: Props) {
  const { tag } = await searchParams;

  const games = tag ? await getGamesByTag(tag) : await getTodaysFeed();

  let activeTagName: string | null = null;
  if (tag) {
    const allTags = await getAllTags();
    activeTagName = allTags.find((t) => t.slug === tag)?.name ?? tag;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Browse Games</h1>
      <p className="mt-1 text-muted-foreground">
        Explore all vibecoded games on VibeHunt
      </p>

      {activeTagName && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
          >
            {activeTagName}
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {games.map((game) => (
          <GameCard
            key={game.id}
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
        ))}

        {games.length === 0 && (
          <div className="py-16 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {tag
                ? `No games found with tag "${activeTagName}"`
                : "No games found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
