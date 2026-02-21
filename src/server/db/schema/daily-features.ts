import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { games } from "./games";

export const dailyFeatures = pgTable(
  "daily_features",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    date: date("date").notNull().unique(),
    rank: integer("rank").notNull(),
    upvotesAtEnd: integer("upvotes_at_end").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    staffNote: text("staff_note"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("daily_features_date_rank_idx").on(table.date, table.rank)]
);

export const dailyFeaturesRelations = relations(dailyFeatures, ({ one }) => ({
  game: one(games, {
    fields: [dailyFeatures.gameId],
    references: [games.id],
  }),
}));
