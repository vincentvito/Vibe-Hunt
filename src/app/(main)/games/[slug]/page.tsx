import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  ExternalLink,
  Github,
  Sparkles,
  Calendar,
  Play,
  Globe,
  Instagram,
} from "lucide-react";
import { XIcon } from "@/components/icons/x-icon";
import { getGameBySlug } from "@/server/queries/games";
import { getGameComments } from "@/server/queries/comments";
import { UpvoteButton } from "@/components/social/upvote-button";
import { WasmPlayer } from "@/components/player/wasm-player";
import { CommentThread } from "@/components/social/comment-thread";
import { GameJsonLd } from "@/components/seo/game-jsonld";
import { timeAgo } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Not Found" };

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://vibehunt.com"}/games/${game.slug}`;
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
  const [game, comments] = await Promise.all([
    getGameBySlug(slug),
    getGameBySlug(slug).then((g) =>
      g ? getGameComments(g.id) : []
    ),
  ]);

  if (!game) notFound();

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
              {game.engine.replace("_", " ")}
            </span>
          </div>
        </div>
        <UpvoteButton
          gameId={game.id}
          initialCount={game.upvoteCount}
          initialUpvoted={false}
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

      {/* Description */}
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">About</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {game.description}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-8">
        <CommentThread comments={comments} gameId={game.id} />
      </div>
    </div>
  );
}
