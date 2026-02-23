import { timeAgo } from "@/lib/utils";

type Devlog = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
};

export function DevlogList({ devlogs }: { devlogs: Devlog[] }) {
  if (devlogs.length === 0) return null;

  return (
    <div className="space-y-4">
      {devlogs.map((entry) => (
        <article
          key={entry.id}
          className="rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{entry.title}</h3>
            <time className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(entry.createdAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {entry.body}
          </p>
        </article>
      ))}
    </div>
  );
}
