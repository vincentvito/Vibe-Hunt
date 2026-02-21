import {
  pgTable,
  text,
  timestamp,
  integer,
  numeric,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";

export const bountyStatusEnum = pgEnum("bounty_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
]);

export const bidStatusEnum = pgEnum("bid_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const bounties = pgTable(
  "bounties",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    requirements: text("requirements").array().notNull().default([]),
    budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    deadline: timestamp("deadline"),
    tags: text("tags").array().notNull().default([]),
    status: bountyStatusEnum("status").notNull().default("open"),

    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    acceptedBidId: text("accepted_bid_id").unique(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("bounties_status_created_idx").on(table.status, table.createdAt),
    index("bounties_requester_id_idx").on(table.requesterId),
  ]
);

export const bountyBids = pgTable(
  "bounty_bids",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    bountyId: text("bounty_id")
      .notNull()
      .references(() => bounties.id, { onDelete: "cascade" }),
    bidderId: text("bidder_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    estimatedDays: integer("estimated_days").notNull(),
    proposal: text("proposal").notNull(),
    portfolioLinks: text("portfolio_links").array().notNull().default([]),
    status: bidStatusEnum("status").notNull().default("pending"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("bounty_bids_bounty_bidder_unique").on(
      table.bountyId,
      table.bidderId
    ),
    index("bounty_bids_bounty_status_idx").on(table.bountyId, table.status),
  ]
);

export const bountiesRelations = relations(bounties, ({ one, many }) => ({
  requester: one(users, {
    fields: [bounties.requesterId],
    references: [users.id],
  }),
  bids: many(bountyBids),
}));

export const bountyBidsRelations = relations(bountyBids, ({ one }) => ({
  bounty: one(bounties, {
    fields: [bountyBids.bountyId],
    references: [bounties.id],
  }),
  bidder: one(users, {
    fields: [bountyBids.bidderId],
    references: [users.id],
  }),
}));
