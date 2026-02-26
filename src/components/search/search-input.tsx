"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const latestValue = useRef(value);
  latestValue.current = value;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only navigate if value hasn't changed since this timer was set
      if (latestValue.current !== value) return;
      const trimmed = value.trim();
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      } else if (initialQuery) {
        router.push("/search");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value, router, initialQuery]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search games, tags..."
        className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
        autoFocus
      />
    </div>
  );
}
