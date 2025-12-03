import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { likes, postMedia, posts } from "@/db/schema/post-shema";
import { users } from "@/db/schema/auth-schema";
import type * as z from "zod";
import { follows } from "@/db/schema/follow-schema";

export const selectUserSchema = createSelectSchema(users);

export const selectPostSchema = createSelectSchema(posts);
export const insertPostSchema = createInsertSchema(posts, {
  content: (schema) => schema.min(1, "Content is required").max(280),
});
export type InsertPost = z.infer<typeof insertPostSchema>;

export const selectPostMediaSchema = createSelectSchema(postMedia);
export const insertPostMediaSchema = createInsertSchema(postMedia, {
  postId: (schema) => schema.optional(),
});
export type InsertPostMedia = z.infer<typeof insertPostMediaSchema>;

export const selectLikeSchema = createSelectSchema(likes);
export const insertLikeSchema = createInsertSchema(likes);
export type InsertLike = z.infer<typeof insertLikeSchema>;

export const selectFollowSchema = createSelectSchema(follows);
export const insertFollowSchema = createInsertSchema(follows);
export type InsertFollow = z.infer<typeof insertFollowSchema>;
