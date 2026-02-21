import { Suspense } from "react";
import { getAllTags } from "@/server/queries/tags";
import { CategoryMarquee } from "./category-marquee";

async function CategoryBarContent() {
  const tags = await getAllTags();

  if (tags.length === 0) return null;

  return <CategoryMarquee tags={tags} />;
}

function CategoryBarSkeleton() {
  return (
    <div className="border-t border-border bg-card/50 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-3 h-4 w-36 rounded bg-muted animate-pulse" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-9 shrink-0 rounded-full bg-muted animate-pulse"
              style={{ width: `${60 + Math.random() * 40}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoryBar() {
  return (
    <Suspense fallback={<CategoryBarSkeleton />}>
      <CategoryBarContent />
    </Suspense>
  );
}
