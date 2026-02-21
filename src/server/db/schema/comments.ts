import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { games } from "./games";

export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    body: text("body").notNull(),
    isEdited: boolean("is_edited").notNull().default(false),

    // Threading
    parentId: text("parent_id"),
    depth: integer("depth").notNull().default(0),

    // Relations
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("comments_game_created_idx").on(table.gameId, table.createdAt),
    index("comments_parent_id_idx").on(table.parentId),
  ]
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [comments.gameId],
    references: [games.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
}));
