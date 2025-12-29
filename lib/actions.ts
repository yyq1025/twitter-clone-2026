import { createOptimisticAction } from "@tanstack/react-db";
import type { InsertLike, InsertPost } from "@/db/validation";
import {
  electricLikeCollection,
  electricPostCollection,
} from "@/lib/collections";

export const createPost = createOptimisticAction<InsertPost>({
  onMutate: (postData) => {
    electricPostCollection.insert({
      ...postData,
      created_at: new Date(),
      like_count: 0,
      repost_count: 0,
      reply_count: 0,
      post_media: postData.post_media || [],
      reply_to_id: postData.reply_to_id || null,
      quote_id: postData.quote_id || null,
    });
    if (postData.reply_to_id) {
      electricPostCollection.update(postData.reply_to_id, (draft) => {
        draft.reply_count += 1;
      });
    }
  },
  mutationFn: async (postData) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error("Failed to create post");
    }
    const { txid } = await response.json();

    await electricPostCollection.utils.awaitTxId(txid);
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
