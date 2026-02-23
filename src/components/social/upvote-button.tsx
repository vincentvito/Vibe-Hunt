"use client";

import { useState, useTransition } from "react";
import { ChevronUp } from "lucide-react";
import { toggleUpvote } from "@/server/actions/upvotes";
import { useAuth } from "@clerk/nextjs";
import { cn, formatCompactNumber } from "@/lib/utils";

type UpvoteButtonProps = {
  gameId: string;
  initialCount: number;
  initialUpvoted: boolean;
};

export function UpvoteButton({
  gameId,
  initialCount,
  initialUpvoted,
}: UpvoteButtonProps) {
  const { isSignedIn } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) return;

    // Capture pre-click state for rollback
    const prevUpvoted = upvoted;
    const prevCount = count;

    // Optimistic update
    setUpvoted(!upvoted);
    setCount((c) => (upvoted ? c - 1 : c + 1));

    startTransition(async () => {
      const result = await toggleUpvote(gameId);
      if (!result.success) {
        // Rollback to pre-click state
        setUpvoted(prevUpvoted);
        setCount(prevCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || !isSignedIn}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
        upvoted
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
        isPending && "opacity-50"
      )}
    >
      <ChevronUp className={cn("h-4 w-4", upvoted && "text-primary")} />
      <span>{formatCompactNumber(count)}</span>
    </button>
  );
}
