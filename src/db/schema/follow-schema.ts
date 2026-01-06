import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const follows = pgTable(
  "follows",
  {
    creator_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.creator_id, table.subject_id] })],
);
