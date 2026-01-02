import {
  type AnyPgColumn,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

interface PostMedia {
  url: string;
  type: string;
}

export const posts = pgTable("posts", {
  id: uuid().primaryKey(),
  creator_id: text().references(() => users.id, { onDelete: "set null" }),
  content: text().notNull(),
  media: jsonb().$type<PostMedia[]>().default([]).notNull(),
  media_length: integer().default(0).notNull(),

  reply_root_id: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  reply_parent_id: uuid().references((): AnyPgColumn => posts.id, {
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
