export type FeedSort = "hot" | "new" | "top";

export type FeedGame = {
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
};

export type FeedResponse = {
  games: FeedGame[];
  upvotedIds: string[];
};
