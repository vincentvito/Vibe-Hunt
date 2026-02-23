"use client";

import { useState, useTransition } from "react";
import { createDevlog } from "@/server/actions/devlogs";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function DevlogForm({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createDevlog({ title, body, gameId });
      if (result.success) {
        setTitle("");
        setBody("");
        setOpen(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
      >
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        Post an Update
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update title"
            maxLength={200}
            className={INPUT_CLASS}
            required
          />
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's new with your game?"
              maxLength={5000}
              rows={4}
              className={INPUT_CLASS}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {body.length}/5000
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={isPending || !title.trim() || !body.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Update"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
