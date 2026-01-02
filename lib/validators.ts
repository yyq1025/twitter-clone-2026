import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { users } from "@/db/schema/auth-schema";
import { feed_items } from "@/db/schema/feed-item-schema";
import { follows } from "@/db/schema/follow-schema";
import { likes } from "@/db/schema/like-schema";
import { posts } from "@/db/schema/post-shema";

export const selectUserSchema = createSelectSchema(users);
export type SelectUser = z.infer<typeof selectUserSchema>;

export const selectFeedItemSchema = createSelectSchema(feed_items);

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

const postCreateEventSchema = z.object({
  type: z.literal("post.create"),
  payload: insertPostSchema,
});

const postActionEventSchema = z.object({
  type: z.enum([
    "post.delete",
    "post.like",
    "post.unlike",
    "post.repost",
    "post.unrepost",
  ]),
  payload: z.object({
    post_id: selectPostSchema.shape.id,
  }),
});

const userActionEventSchema = z.object({
  type: z.enum(["user.follow", "user.unfollow"]),
  payload: z.object({
    subject_id: selectUserSchema.shape.id,
  }),
});

export const eventSchema = z.union([
  postCreateEventSchema,
  postActionEventSchema,
  userActionEventSchema,
]);

export type Event = z.infer<typeof eventSchema>;
