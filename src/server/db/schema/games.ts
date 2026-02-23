import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { upvotes } from "./upvotes";
import { comments } from "./comments";
import { listings } from "./listings";
import { promptHistories } from "./prompts";
import { templateLicenses } from "./licenses";
import { gameStats } from "./stats";
import { dailyFeatures } from "./daily-features";
import { screenshots, gameTags } from "./game-extras";
import { devlogs } from "./devlogs";

export const gameStatusEnum = pgEnum("game_status", [
  "draft",
  "in_review",
  "published",
  "archived",
  "suspended",
]);

export const gameEngineEnum = pgEnum("game_engine", [
  "unity_webgl",
  "godot_web",
  "custom_wasm",
  "html5_canvas",
  "playcanvas",
  "phaserjs",
  "threejs",
  "other",
]);

export const games = pgTable(
  "games",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    engine: gameEngineEnum("engine").notNull(),
    status: gameStatusEnum("status").notNull().default("draft"),

    // Web Build
    webBuildUrl: text("web_build_url"),
    webBuildStorage: text("web_build_storage"),
    buildSizeBytes: bigint("build_size_bytes", { mode: "number" }),
    iframeAllowed: boolean("iframe_allowed").notNull().default(true),

    // Media
    thumbnailUrl: text("thumbnail_url"),
    coverImageUrl: text("cover_image_url"),
    videoUrl: text("video_url"),

    // Metadata
    websiteUrl: text("website_url"),
    sourceCodeUrl: text("source_code_url"),
    madeWithAi: boolean("made_with_ai").notNull().default(false),
    aiToolsUsed: text("ai_tools_used")
      .array()
      .notNull()
      .default([]),

    // Denormalized counters
    upvoteCount: integer("upvote_count").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    playCount: integer("play_count").notNull().default(0),

    // Dates
    launchDate: timestamp("launch_date"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    // Relations
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    remixedFromId: text("remixed_from_id"),
  },
  (table) => [
    index("games_creator_id_idx").on(table.creatorId),
    index("games_status_launch_idx").on(table.status, table.launchDate),
    uniqueIndex("games_slug_idx").on(table.slug),
    index("games_upvote_count_idx").on(table.upvoteCount),
  ]
);

export const gamesRelations = relations(games, ({ one, many }) => ({
  creator: one(users, {
    fields: [games.creatorId],
    references: [users.id],
  }),
  remixedFrom: one(games, {
    fields: [games.remixedFromId],
    references: [games.id],
    relationName: "remixes",
  }),
  remixes: many(games, { relationName: "remixes" }),
  screenshots: many(screenshots),
  tags: many(gameTags),
  upvotes: many(upvotes),
  comments: many(comments),
  listing: one(listings),
  promptHistories: many(promptHistories),
  templateLicense: one(templateLicenses),
  gameStats: many(gameStats),
  dailyFeatures: many(dailyFeatures),
  devlogs: many(devlogs),
}));
