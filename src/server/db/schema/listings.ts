import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { games } from "./games";
import { offers } from "./offers";

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "active",
  "under_offer",
  "sold",
  "withdrawn",
]);

export const assetTypeEnum = pgEnum("asset_type", [
  "full_ip",
  "codebase_only",
  "assets_only",
  "codebase_and_assets",
  "license_only",
]);

export const listings = pgTable(
  "listings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    gameId: text("game_id")
      .notNull()
      .unique()
      .references(() => games.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Pricing
    askingPrice: numeric("asking_price", { precision: 12, scale: 2 }).notNull(),
    minimumOffer: numeric("minimum_offer", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("USD"),

    // What's included
    assetType: assetTypeEnum("asset_type").notNull(),
    includedAssets: text("included_assets").array().notNull().default([]),
    techStack: text("tech_stack").array().notNull().default([]),
    description: text("description").notNull(),
    transferMethod: text("transfer_method"),

    // Metrics snapshot
    monthlyRevenue: numeric("monthly_revenue", { precision: 12, scale: 2 }),
    totalDownloads: integer("total_downloads"),
    monthlyUsers: integer("monthly_users"),

    status: listingStatusEnum("status").notNull().default("draft"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("listings_status_price_idx").on(table.status, table.askingPrice),
    index("listings_seller_id_idx").on(table.sellerId),
  ]
);

export const listingsRelations = relations(listings, ({ one, many }) => ({
  game: one(games, {
    fields: [listings.gameId],
    references: [games.id],
  }),
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  offers: many(offers),
}));
