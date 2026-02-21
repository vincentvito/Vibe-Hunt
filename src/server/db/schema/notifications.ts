import {
  pgTable,
  text,
  boolean,
  timestamp,
  json,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
  "upvote",
  "comment",
  "comment_reply",
  "new_follower",
  "offer_received",
  "offer_accepted",
  "offer_rejected",
  "escrow_released",
  "bounty_bid",
  "bounty_accepted",
  "daily_featured",
  "remix_created",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    isRead: boolean("is_read").notNull().default(false),
    metadata: json("metadata"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_read_created_idx").on(
      table.userId,
      table.isRead,
      table.createdAt
    ),
  ]
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
