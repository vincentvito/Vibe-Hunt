import { Suspense } from "react";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { searchGames } from "@/server/queries/search";
import { GameCard } from "@/components/games/game-card";
import { SearchInput } from "@/components/search/search-input";
import { GameCardListSkeleton } from "@/components/skeletons/game-card-skeleton";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for games on VibeHunt",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="mt-6">
        <SearchInput initialQuery={query} />
      </div>

      {query ? (
        <Suspense fallback={<GameCardListSkeleton count={3} />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <div className="mt-16 py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Search games by title, tagline, or tags.
          </p>
        </div>
      )}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchGames(query);

  if (results.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          No games found for &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>
      {results.map((game) => (
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
          hasUpvoted={false}
        />
      ))}
    </div>
  );
}
