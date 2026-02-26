import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  Github,
  Sparkles,
  Calendar,
  Play,
  Globe,
  Instagram,
} from "lucide-react";
import { XIcon } from "@/components/icons/x-icon";
import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";
import { getGameBySlug, hasUserUpvoted } from "@/server/queries/games";
import { getGameComments } from "@/server/queries/comments";
import { UpvoteButton } from "@/components/social/upvote-button";
import { WasmPlayer } from "@/components/player/wasm-player";
import { CommentThread } from "@/components/social/comment-thread";
import { GameJsonLd } from "@/components/seo/game-jsonld";
import { getGameDevlogs } from "@/server/queries/devlogs";
import { DevlogForm } from "@/components/devlogs/devlog-form";
import { DevlogList } from "@/components/devlogs/devlog-list";
import { timeAgo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Not Found" };

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://vibehunt.games"}/games/${game.slug}`;
  const image = game.coverImageUrl ?? game.thumbnailUrl;

  return {
    title: game.title,
    description: game.tagline,
    openGraph: {
      type: "article",
      title: game.title,
      description: game.tagline,
      url,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: game.title,
      description: game.tagline,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  const [comments, authResult, screenshotsResult, devlogs] = await Promise.all([
    getGameComments(game.id),
    (async () => {
      const supabaseAuth = await createServerClient();
      const { data: { user: authUser } } = await supabaseAuth.auth.getUser();
      if (!authUser) return { upvoted: false, currentUserId: null };
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authUser.id)
        .limit(1)
        .maybeSingle();
      if (!user) return { upvoted: false, currentUserId: null };
      const upvoted = await hasUserUpvoted(user.id, game.id);
      return { upvoted, currentUserId: user.id };
    })(),
    supabase
      .from("screenshots")
      .select("id, url, alt_text, sort_order")
      .eq("game_id", game.id)
      .order("sort_order", { ascending: true }),
    getGameDevlogs(game.id),
  ]);

  const { upvoted, currentUserId } = authResult;
  const screenshots = screenshotsResult.data ?? [];
  const isCreator = currentUserId === game.creatorId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <GameJsonLd
        title={game.title}
        description={game.description}
        slug={game.slug}
        thumbnailUrl={game.thumbnailUrl ?? game.coverImageUrl}
        creatorName={game.creatorName}
        publishedAt={game.publishedAt}
      />
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">{game.title}</h1>
            {game.madeWithAi && (
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                <Sparkles className="h-4 w-4" />
                Vibecoded
              </span>
            )}
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{game.tagline}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <Link
              href={`/profile/${game.creatorUsername}`}
              className="flex items-center gap-2 hover:text-foreground"
            >
              {game.creatorAvatar ? (
                <Image
                  src={game.creatorAvatar}
                  alt={game.creatorName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted" />
              )}
              {game.creatorName}
            </Link>
            {game.creatorTwitterUrl && (
              <a
                href={game.creatorTwitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                title="X (Twitter)"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {game.creatorInstagramUrl && (
              <a
                href={game.creatorInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                title="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {game.publishedAt ? timeAgo(game.publishedAt) : "Draft"}
            </span>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase">
              {game.engine.replaceAll("_", " ")}
            </span>
          </div>
        </div>
        <UpvoteButton
          gameId={game.id}
          initialCount={game.upvoteCount}
          initialUpvoted={upvoted}
        />
      </div>

      {/* Player */}
      {game.webBuildUrl && (
        <div className="mt-6">
          <WasmPlayer
            buildUrl={game.webBuildUrl}
            title={game.title}
          />
        </div>
      )}

      {/* Cover image fallback */}
      {!game.webBuildUrl && game.coverImageUrl && (
        <div className="relative mt-6 overflow-hidden rounded-xl" style={{ aspectRatio: "16/9" }}>
          <Image
            src={game.coverImageUrl}
            alt={game.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Links */}
      <div className="mt-4 flex flex-wrap gap-2">
        {game.webBuildUrl && (
          <Link
            href={`/play/${game.slug}`}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-4 w-4" />
            Play Fullscreen
          </Link>
        )}
        {game.websiteUrl && (
          <a
            href={game.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Globe className="h-4 w-4" />
            Website
          </a>
        )}
        {game.sourceCodeUrl && (
          <a
            href={game.sourceCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Github className="h-4 w-4" />
            Source Code
          </a>
        )}
      </div>

      {/* AI Tools */}
      {game.aiToolsUsed.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Built with
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {game.aiToolsUsed.map((tool: string) => (
              <span
                key={tool}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
              >
                {tool.charAt(0).toUpperCase() + tool.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Screenshots</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {screenshots.map((s: any) => (
              <div
                key={s.id}
                className="relative overflow-hidden rounded-lg"
                style={{ aspectRatio: "16/9" }}
              >
                <Image
                  src={s.url}
                  alt={s.alt_text ?? `${game.title} screenshot`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">About</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {game.description}
        </div>
      </div>

      {/* Devlogs */}
      {(devlogs.length > 0 || isCreator) && (
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">Updates</h2>
          {isCreator && (
            <div className="mt-3">
              <DevlogForm gameId={game.id} />
            </div>
          )}
          {devlogs.length > 0 && (
            <div className="mt-4">
              <DevlogList devlogs={devlogs} />
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-8">
        <CommentThread comments={comments} gameId={game.id} />
      </div>
    </div>
  );
}
