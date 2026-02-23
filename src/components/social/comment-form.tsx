"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createComment } from "@/server/actions/comments";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

type CommentFormProps = {
  gameId: string;
  parentId?: string;
  onSuccess?: () => void;
  compact?: boolean;
};

export function CommentForm({
  gameId,
  parentId,
  onSuccess,
  compact,
}: CommentFormProps) {
  const { isSignedIn } = useAuth();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !isSignedIn) return;
    setError(null);

    startTransition(async () => {
      const result = await createComment({ body: body.trim(), gameId, parentId });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setBody("");
      onSuccess?.();
    });
  }

  if (!isSignedIn) {
    return (
      <p className="rounded-lg border border-border p-3 text-center text-sm text-muted-foreground">
        Sign in to leave a comment
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <div className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={compact ? "Write a reply..." : "Share your thoughts..."}
        className={cn(
          "flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary",
          compact && "py-1.5 text-xs"
        )}
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={!body.trim() || isPending}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className={cn("h-4 w-4", compact && "h-3 w-3")} />
      </button>
      </div>
    </form>
  );
}
