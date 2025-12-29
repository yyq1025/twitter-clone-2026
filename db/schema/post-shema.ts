import {
  type AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

interface PostMedia {
  url: string;
  type: string;
  width: number;
  height: number;
}

export const posts = pgTable("posts", {
  id: uuid().primaryKey(),
  user_id: text()
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  content: text().notNull(),
  post_media: jsonb().$type<PostMedia[]>().default([]).notNull(),

  reply_to_id: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  quote_id: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),

  repost_count: integer().default(0).notNull(),
  reply_count: integer().default(0).notNull(),
  like_count: integer().default(0).notNull(),

  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    user_id: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    post_id: uuid()
      .notNull()
      .references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.user_id, table.post_id] })],
);
