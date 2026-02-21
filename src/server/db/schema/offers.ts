import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { listings } from "./listings";

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "accepted",
  "rejected",
  "countered",
  "in_escrow",
  "escrow_released",
  "disputed",
  "cancelled",
  "expired",
]);

export const offers = pgTable(
  "offers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Offer details
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("USD"),
    message: text("message"),
    counterAmount: numeric("counter_amount", { precision: 12, scale: 2 }),

    // Escrow
    status: offerStatusEnum("status").notNull().default("pending"),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    platformFeeAmount: numeric("platform_fee_amount", {
      precision: 12,
      scale: 2,
    }),
    escrowEnteredAt: timestamp("escrow_entered_at"),
    escrowReleasedAt: timestamp("escrow_released_at"),
    escrowDeadline: timestamp("escrow_deadline"),

    // Delivery
    deliveryConfirmedByBuyer: boolean("delivery_confirmed_by_buyer")
      .notNull()
      .default(false),
    deliveryConfirmedBySeller: boolean("delivery_confirmed_by_seller")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("offers_listing_status_idx").on(table.listingId, table.status),
    index("offers_buyer_id_idx").on(table.buyerId),
    index("offers_seller_id_idx").on(table.sellerId),
  ]
);

export const offersRelations = relations(offers, ({ one }) => ({
  listing: one(listings, {
    fields: [offers.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [offers.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [offers.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));
