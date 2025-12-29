import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const follows = pgTable(
  "follows",
  {
    follower_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    following_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.follower_id, table.following_id] })],
);
