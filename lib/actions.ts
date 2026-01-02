import { createOptimisticAction } from "@tanstack/react-db";
import {
  electricFeedItemCollection,
  electricLikeCollection,
  electricPostCollection,
} from "@/lib/collections";
import type { InsertLike, InsertPost } from "@/lib/validators";

export const createPost = createOptimisticAction<{
  payload: InsertPost;
  userId: string;
}>({
  onMutate: ({ payload, userId }) => {
    electricPostCollection.insert({
      ...payload,
      creator_id: userId,
      media: payload.media || [],
      media_length: payload.media?.length || 0,
      created_at: new Date(),
      like_count: 0,
      repost_count: 0,
      reply_count: 0,
      reply_root_id: payload.reply_root_id || null,
      reply_parent_id: payload.reply_parent_id || null,
      quote_id: payload.quote_id || null,
    });
    electricFeedItemCollection.insert({
      type: "post",
      creator_id: userId,
      post_id: payload.id,
      created_at: new Date(),
    });
    if (payload.reply_parent_id) {
      electricPostCollection.update(payload.reply_parent_id, (draft) => {
        draft.reply_count += 1;
      });
    }
  },
  mutationFn: async ({ payload }) => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "post.create",
        payload,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create post event");
    }
    const { txid } = await response.json();

    await Promise.all([
      electricPostCollection.utils.awaitTxId(txid),
      electricFeedItemCollection.utils.awaitTxId(txid),
    ]);
  },
});

export const likePost = createOptimisticAction<InsertLike>({
  onMutate: ({ user_id, post_id }) => {
    electricLikeCollection.insert({
      user_id,
      post_id,
      created_at: new Date(),
    });

    electricPostCollection.update(post_id, (draft) => {
      draft.like_count += 1;
    });
  },
  mutationFn: async ({ post_id }) => {
    const response = await fetch("/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_id }),
    });
    if (!response.ok) {
      throw new Error("Failed to like post");
    }
    const { txid } = await response.json();

    await Promise.all([
      electricLikeCollection.utils.awaitTxId(txid),
      electricPostCollection.utils.awaitTxId(txid),
    ]);
  },
});

export const unlikePost = createOptimisticAction<InsertLike>({
  onMutate: ({ user_id, post_id }) => {
    electricLikeCollection.delete(`${user_id}-${post_id}`);

    electricPostCollection.update(post_id, (draft) => {
      draft.like_count -= 1;
    });
  },
  mutationFn: async ({ post_id }) => {
    const response = await fetch(`/api/likes?post_id=${post_id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to unlike post");
    }
    const { txid } = await response.json();

    await Promise.all([
      electricLikeCollection.utils.awaitTxId(txid),
      electricPostCollection.utils.awaitTxId(txid),
    ]);
  },
});
