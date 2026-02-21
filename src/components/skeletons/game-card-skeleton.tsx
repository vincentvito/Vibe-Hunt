export function GameCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      {/* Thumbnail */}
      <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-muted" />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-4 w-60 animate-pulse rounded bg-muted" />
        <div className="mt-2.5 flex gap-3">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-10 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Upvote */}
      <div className="flex h-14 w-10 animate-pulse flex-col items-center rounded-lg bg-muted" />
    </div>
  );
}

export function GameCardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
