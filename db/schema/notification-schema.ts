import {
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { posts } from "./post-shema";

export const notifications = pgTable(
  "notifications",
  {
    id: serial().primaryKey(),
    creator_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipient_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reason: text().notNull(),
    subject_id: uuid().references(() => posts.id, {
      onDelete: "cascade",
    }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique().on(
      table.creator_id,
      table.recipient_id,
      table.reason,
      table.subject_id,
    ),
  ],
);
