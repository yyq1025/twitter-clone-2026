import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { InsertPost } from "../validation";
import { users } from "./auth-schema";
import { posts } from "./post-shema";

export const events = pgTable("events", {
  id: uuid().primaryKey(),
  actor_id: text().references(() => users.id, { onDelete: "set null" }),
  type: text().notNull(),
  subject_post_id: uuid().references(() => posts.id, { onDelete: "set null" }),
  target_post_id: uuid().references(() => posts.id, { onDelete: "set null" }),
  target_user_id: text().references(() => users.id, { onDelete: "set null" }),
  payload: jsonb().$type<InsertPost>(),

  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
