import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  json,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { games } from "./games";

export const gameStats = pgTable(
  "game_stats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    date: date("date").notNull(),

    // Engagement
    plays: integer("plays").notNull().default(0),
    uniquePlayers: integer("unique_players").notNull().default(0),
    avgSessionSeconds: integer("avg_session_seconds").notNull().default(0),
    totalSessionSeconds: integer("total_session_seconds").notNull().default(0),
    bounceRate: numeric("bounce_rate", { precision: 5, scale: 4 }),

    // Retention
    returningPlayers: integer("returning_players").notNull().default(0),
    day1Retention: numeric("day1_retention", { precision: 5, scale: 4 }),

    // Source
    analyticsProvider: text("analytics_provider").notNull(),
    isVerified: boolean("is_verified").notNull().default(false),
    rawPayload: json("raw_payload"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("game_stats_game_date_unique").on(table.gameId, table.date),
    index("game_stats_game_date_idx").on(table.gameId, table.date),
  ]
);

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
  game: one(games, {
    fields: [gameStats.gameId],
    references: [games.id],
  }),
}));
