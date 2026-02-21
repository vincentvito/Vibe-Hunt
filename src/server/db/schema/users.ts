import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

export const userRoleEnum = pgEnum("user_role", ["creator", "buyer", "admin"]);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    websiteUrl: text("website_url"),
    githubUrl: text("github_url"),
    twitterUrl: text("twitter_url"),
    instagramUrl: text("instagram_url"),
    discordHandle: text("discord_handle"),
    role: userRoleEnum("role").notNull().default("creator"),
    isVerified: boolean("is_verified").notNull().default(false),
    stripeAccountId: text("stripe_account_id").unique(),
    onboardingComplete: boolean("onboarding_complete").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_clerk_id_idx").on(table.clerkId),
    uniqueIndex("users_username_idx").on(table.username),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  upvotes: many(upvotes),
  comments: many(comments),
  followsGiven: many(follows, { relationName: "follower" }),
  followsReceived: many(follows, { relationName: "following" }),
  listings: many(listings),
  bountiesCreated: many(bounties),
  bountyBids: many(bountyBids),
  promptHistories: many(promptHistories),
  notifications: many(notifications),
}));

// Forward references - these will be resolved when all schemas are loaded
import { games } from "./games";
import { upvotes } from "./upvotes";
import { comments } from "./comments";
import { follows } from "./follows";
import { listings } from "./listings";
import { bounties, bountyBids } from "./bounties";
import { promptHistories } from "./prompts";
import { notifications } from "./notifications";
