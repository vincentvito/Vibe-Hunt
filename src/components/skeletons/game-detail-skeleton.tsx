export function GameDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-5 w-96 animate-pulse rounded bg-muted" />
          <div className="flex gap-4 pt-1">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-14 w-10 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Player area */}
      <div className="mt-6 aspect-video animate-pulse rounded-xl bg-muted" />

      {/* Links */}
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Description */}
      <div className="mt-8 border-t border-border pt-8">
        <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-8">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-20 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
