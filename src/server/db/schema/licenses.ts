import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { games } from "./games";

export const licenseTypeEnum = pgEnum("license_type", [
  "free",
  "attribution",
  "commercial",
  "restricted",
]);

export const templateLicenses = pgTable("template_licenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  gameId: text("game_id")
    .notNull()
    .unique()
    .references(() => games.id, { onDelete: "cascade" }),

  licenseType: licenseTypeEnum("license_type").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  terms: text("terms"),
  allowCommercial: boolean("allow_commercial").notNull().default(false),
  requireAttribution: boolean("require_attribution").notNull().default(true),
  maxRemixes: integer("max_remixes"),

  remixCount: integer("remix_count").notNull().default(0),
  revenue: numeric("revenue", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const templatePurchases = pgTable(
  "template_purchases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    licenseId: text("license_id")
      .notNull()
      .references(() => templateLicenses.id, { onDelete: "cascade" }),
    buyerId: text("buyer_id").notNull(),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
    stripePaymentId: text("stripe_payment_id").unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("template_purchases_license_buyer_unique").on(
      table.licenseId,
      table.buyerId
    ),
  ]
);

export const templateLicensesRelations = relations(
  templateLicenses,
  ({ one, many }) => ({
    game: one(games, {
      fields: [templateLicenses.gameId],
      references: [games.id],
    }),
    purchases: many(templatePurchases),
  })
);

export const templatePurchasesRelations = relations(
  templatePurchases,
  ({ one }) => ({
    license: one(templateLicenses, {
      fields: [templatePurchases.licenseId],
      references: [templateLicenses.id],
    }),
  })
);
