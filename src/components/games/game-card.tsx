"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronUp, MessageSquare, Play, Sparkles } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { UpvoteButton } from "@/components/social/upvote-button";

type GameCardProps = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  engine: string;
  thumbnailUrl: string | null;
  webBuildUrl: string | null;
  madeWithAi: boolean;
  upvoteCount: number;
  commentCount: number;
  playCount: number;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string | null;
  hasUpvoted?: boolean;
};

export function GameCard({
  id,
  slug,
  title,
  tagline,
  engine,
  thumbnailUrl,
  webBuildUrl,
  madeWithAi,
  upvoteCount,
  commentCount,
  playCount,
  creatorName,
  creatorUsername,
  creatorAvatar,
  hasUpvoted = false,
}: GameCardProps) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
      {/* Thumbnail */}
      <Link
        href={`/games/${slug}`}
        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Play className="h-8 w-8" />
          </div>
        )}
        {webBuildUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-6 w-6 text-white" fill="white" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/games/${slug}`}
            className="truncate text-base font-semibold hover:text-primary"
          >
            {title}
          </Link>
          {madeWithAi && (
            <span className="flex items-center gap-0.5 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <Sparkles className="h-3 w-3" />
              AI
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {tagline}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <Link
            href={`/profile/${creatorUsername}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            {creatorAvatar ? (
              <Image
                src={creatorAvatar}
                alt={creatorName}
                width={16}
                height={16}
                className="rounded-full"
              />
            ) : (
              <div className="h-4 w-4 rounded-full bg-muted" />
            )}
            {creatorName}
          </Link>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {formatCompactNumber(commentCount)}
          </span>
          {playCount > 0 && (
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {formatCompactNumber(playCount)}
            </span>
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
            {engine.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Upvote */}
      <UpvoteButton
        gameId={id}
        initialCount={upvoteCount}
        initialUpvoted={hasUpvoted}
      />
    </div>
  );
}
