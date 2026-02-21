import {
  pgTable,
  text,
  timestamp,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { games } from "./games";

export const upvotes = pgTable(
  "upvotes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("upvotes_user_game_unique").on(table.userId, table.gameId),
    index("upvotes_game_date_idx").on(table.gameId, table.date),
    index("upvotes_user_id_idx").on(table.userId),
  ]
);

export const upvotesRelations = relations(upvotes, ({ one }) => ({
  user: one(users, {
    fields: [upvotes.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [upvotes.gameId],
    references: [games.id],
  }),
}));
