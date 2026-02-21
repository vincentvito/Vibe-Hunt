import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for games on VibeHunt",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Search</h1>

      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search games, creators, tags..."
            className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-16 py-16 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">
          Full-text search powered by Meilisearch coming soon.
        </p>
      </div>
    </div>
  );
}
