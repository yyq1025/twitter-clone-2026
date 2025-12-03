import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const follows = pgTable(
  "follows",
  {
    followerId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);
