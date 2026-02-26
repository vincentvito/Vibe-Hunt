import { notFound } from "next/navigation";
import Image from "next/image";
import { Github, Globe, Instagram } from "lucide-react";
import { XIcon } from "@/components/icons/x-icon";
import { supabase } from "@/server/db";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  isFollowing,
  getFollowerCount,
  getFollowingCount,
} from "@/server/queries/follows";
import { GameCard } from "@/components/games/game-card";
import { FollowButton } from "@/components/social/follow-button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const { data: user } = await supabase
    .from("users")
    .select("display_name, bio, avatar_url, username")
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  if (!user) return { title: "Profile Not Found" };

  const description = user.bio ?? `${user.display_name}'s games on VibeHunt`;

  return {
    title: `${user.display_name} (@${user.username})`,
    description,
    openGraph: {
      title: `${user.display_name} (@${user.username})`,
      description,
      ...(user.avatar_url ? { images: [{ url: user.avatar_url }] } : {}),
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const { data: user } = await supabase
    .from("users")
    .select(
      "id, display_name, username, bio, avatar_url, website_url, github_url, twitter_url, instagram_url, created_at"
    )
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  if (!user) notFound();

  const [currentUser, followerCount, followingCount] = await Promise.all([
    getCurrentUser(),
    getFollowerCount(user.id),
    getFollowingCount(user.id),
  ]);

  const isUserFollowing =
    currentUser && currentUser.id !== user.id
      ? await isFollowing(currentUser.id, user.id)
      : false;

  const { data: userGames } = await supabase
    .from("games")
    .select(
      "id, slug, title, tagline, engine, thumbnail_url, web_build_url, made_with_ai, upvote_count, comment_count, play_count"
    )
    .eq("creator_id", user.id)
    .order("upvote_count", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.display_name}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-muted" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.display_name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-1 text-sm">{user.bio}</p>}
          <div className="mt-2 flex gap-3">
            {user.github_url && (
              <a
                href={user.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {user.website_url && (
              <a
                href={user.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {user.twitter_url && (
              <a
                href={user.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </a>
            )}
            {user.instagram_url && (
              <a
                href={user.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{followerCount}</strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-foreground">{followingCount}</strong>{" "}
              following
            </span>
          </div>
          {currentUser && currentUser.id !== user.id && (
            <div className="mt-3">
              <FollowButton
                targetUserId={user.id}
                initialFollowing={isUserFollowing}
              />
            </div>
          )}
        </div>
      </div>

      {/* Games */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Games ({userGames?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-3">
          {(userGames ?? []).map((game) => (
            <GameCard
              key={game.id}
              id={game.id}
              slug={game.slug}
              title={game.title}
              tagline={game.tagline}
              engine={game.engine}
              thumbnailUrl={game.thumbnail_url}
              webBuildUrl={game.web_build_url}
              madeWithAi={game.made_with_ai}
              upvoteCount={game.upvote_count}
              commentCount={game.comment_count}
              playCount={game.play_count}
              creatorName={user.display_name}
              creatorUsername={user.username}
              creatorAvatar={user.avatar_url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
