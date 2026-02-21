"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tag = { id: string; name: string; slug: string };

export function CategoryMarquee({ tags }: { tags: Tag[] }) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  if (tags.length === 0) return null;

  // Triple for short lists, double otherwise — ensures seamless loop
  const copies = tags.length < 8 ? 3 : 2;
  const displayTags = Array.from({ length: copies }, () => tags).flat();
  const translateEnd = copies === 3 ? "33.333%" : "50%";
  const duration = tags.length * 3;

  return (
    <section className="category-marquee border-t border-border bg-card/50 py-5 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-3 flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            Browse by Category
          </h3>
        </div>
      </div>

      <div
        className="category-marquee-track flex gap-3 px-4 sm:px-6"
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-translate": `-${translateEnd}`,
          } as React.CSSProperties
        }
      >
        {displayTags.map((tag, i) => (
          <Link
            key={`${tag.id}-${i}`}
            href={`/games?tag=${tag.slug}`}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary hover:bg-primary/10",
              activeTag === tag.slug
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            )}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
