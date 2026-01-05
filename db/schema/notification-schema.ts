import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { posts } from "./post-shema";

export const notifications = pgTable("notifications", {
  id: serial().primaryKey(),
  creator_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipient_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: text().notNull(),
  reason_subject_id: uuid().references(() => posts.id, {
    onDelete: "cascade",
  }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
