import {
  pgTable,
  text,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { games } from "./games";

export const screenshots = pgTable("screenshots", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  gameId: text("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
});

export const screenshotsRelations = relations(screenshots, ({ one }) => ({
  game: one(games, {
    fields: [screenshots.gameId],
    references: [games.id],
  }),
}));

export const tags = pgTable(
  "tags",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
  },
  (table) => [uniqueIndex("tags_slug_idx").on(table.slug)]
);

export const gameTags = pgTable(
  "game_tags",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.tagId] })]
);

export const tagsRelations = relations(tags, ({ many }) => ({
  games: many(gameTags),
}));

export const gameTagsRelations = relations(gameTags, ({ one }) => ({
  game: one(games, {
    fields: [gameTags.gameId],
    references: [games.id],
  }),
  tag: one(tags, {
    fields: [gameTags.tagId],
    references: [tags.id],
  }),
}));
