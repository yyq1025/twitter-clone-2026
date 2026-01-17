import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./better-auth";
import { posts } from "./post";

export const notifications = pgTable("notifications", {
  id: serial().primaryKey(),
  creator_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipient_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text().notNull(),
  reason_post_id: uuid().references(() => posts.id, {
    onDelete: "cascade",
  }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
