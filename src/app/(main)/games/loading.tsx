import { GameCardListSkeleton } from "@/components/skeletons/game-card-skeleton";

export default function GamesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-1 h-5 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6">
        <GameCardListSkeleton count={5} />
      </div>
    </div>
  );
}
