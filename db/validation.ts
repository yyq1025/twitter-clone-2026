import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type * as z from "zod";
import { users } from "@/db/schema/auth-schema";
import { follows } from "@/db/schema/follow-schema";
import { likes, posts } from "@/db/schema/post-shema";

export const selectUserSchema = createSelectSchema(users);
export type SelectUser = z.infer<typeof selectUserSchema>;

export const selectPostSchema = createSelectSchema(posts);
export type SelectPost = z.infer<typeof selectPostSchema>;

export const insertPostSchema = createInsertSchema(posts, {
  content: (schema) => schema.min(1, "Content is required").max(280),
});
export type InsertPost = z.infer<typeof insertPostSchema>;

export const selectLikeSchema = createSelectSchema(likes);
export const insertLikeSchema = createInsertSchema(likes);
export type InsertLike = z.infer<typeof insertLikeSchema>;

export const selectFollowSchema = createSelectSchema(follows);
export const insertFollowSchema = createInsertSchema(follows);
export type InsertFollow = z.infer<typeof insertFollowSchema>;
