import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { games } from "./games";

export const promptSourceEnum = pgEnum("prompt_source", [
  "cursor",
  "claude",
  "chatgpt",
  "copilot",
  "v0",
  "bolt",
  "replit",
  "windsurf",
  "other",
]);

export const promptHistories = pgTable(
  "prompt_histories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    uploaderId: text("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    source: promptSourceEnum("source").notNull(),
    promptCount: integer("prompt_count").notNull(),
    tokenCount: integer("token_count"),
    fileUrl: text("file_url").notNull(),
    fileHash: text("file_hash").notNull(),

    summary: text("summary"),
    isPublic: boolean("is_public").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("prompt_histories_game_sort_idx").on(table.gameId, table.sortOrder),
  ]
);

export const promptHistoriesRelations = relations(
  promptHistories,
  ({ one }) => ({
    game: one(games, {
      fields: [promptHistories.gameId],
      references: [games.id],
    }),
    uploader: one(users, {
      fields: [promptHistories.uploaderId],
      references: [users.id],
    }),
  })
);
