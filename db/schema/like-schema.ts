import {
  type AnyPgColumn,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";
import { posts } from "./post-shema";

export const likes = pgTable(
  "likes",
  {
    creator_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject_id: uuid()
      .notNull()
      .references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.creator_id, table.subject_id] })],
);
