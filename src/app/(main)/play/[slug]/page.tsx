import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGameBySlug } from "@/server/queries/games";
import { WasmPlayer } from "@/components/player/wasm-player";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Not Found" };
  return { title: `Play ${game.title}` };
}

export default async function PlayPage({ params }: Props) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game || !game.webBuildUrl) notFound();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Link
          href={`/games/${game.slug}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {game.title}
        </Link>
      </div>
      <div className="flex-1">
        <WasmPlayer
          buildUrl={game.webBuildUrl}
          title={game.title}
          className="h-full w-full rounded-none border-0"
        />
      </div>
    </div>
  );
}
