import {
  AnyPgColumn,
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  smallint,
} from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const posts = pgTable("posts", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  content: text().notNull(),
  status: text().notNull().default("active"),

  repostId: integer().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  replyToId: integer().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),
  quoteId: integer().references((): AnyPgColumn => posts.id, {
    onDelete: "set null",
  }),

  repostCount: integer().default(0).notNull(),
  replyCount: integer().default(0).notNull(),
  likeCount: integer().default(0).notNull(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const postMedia = pgTable("post_media", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  postId: integer()
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  mediaUrl: text().notNull(),
  mediaType: text().notNull(),
  sortOrder: smallint().notNull(),
  width: integer().notNull().default(0),
  height: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const likes = pgTable(
  "likes",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references((): AnyPgColumn => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })],
);
