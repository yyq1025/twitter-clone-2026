import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { posts } from "./post-shema";

export const feed_items = pgTable("feed_items", {
  id: uuid().primaryKey(),
  creator_id: text().references(() => users.id, { onDelete: "set null" }),
  type: text().notNull(),
  post_id: uuid().references(() => posts.id, { onDelete: "set null" }),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
