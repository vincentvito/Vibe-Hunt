import {
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { games } from "./games";
import { users } from "./users";

export const devlogs = pgTable(
  "devlogs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    body: text("body").notNull(),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("devlogs_game_id_created_at_idx").on(table.gameId, table.createdAt),
  ]
);

export const devlogsRelations = relations(devlogs, ({ one }) => ({
  game: one(games, {
    fields: [devlogs.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [devlogs.userId],
    references: [users.id],
  }),
}));
