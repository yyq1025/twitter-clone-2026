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
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  content: text().notNull(),
  postMedia: jsonb().$type<PostMedia[]>().default([]).notNull(),

  repostId: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  replyToId: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  quoteId: uuid().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),

  repostCount: integer().default(0).notNull(),
  replyCount: integer().default(0).notNull(),
  likeCount: integer().default(0).notNull(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid()
      .notNull()
      .references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })],
);
