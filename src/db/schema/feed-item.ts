import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./better-auth";
import { posts } from "./post";

export const feed_items = pgTable(
  "feed_items",
  {
    creator_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().notNull(),
    post_id: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.creator_id, table.type, table.post_id] }),
  ],
);
