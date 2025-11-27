import { createOptimisticAction } from "@tanstack/react-db";
import {
  electricLikeCollection,
  electricPostCollection,
  electricPostMediaCollection,
} from "@/lib/collections";
import type { InsertLike, InsertPost, InsertPostMedia } from "@/db/validation";

export const createPost = createOptimisticAction<
  InsertPost & { postMedia?: InsertPostMedia[] }
>({
  onMutate: ({ postMedia, ...post }) => {
    const postId = Math.round(Math.random() * 1_000_000_000);
    electricPostCollection.insert({
      ...post,
      id: postId,
      replyToId: post.replyToId ?? null,
      repostId: post.repostId ?? null,
      quoteId: post.quoteId ?? null,
      repostCount: 0,
      replyCount: 0,
      likeCount: 0,
      createdAt: new Date(),
    });
    if (postMedia && postMedia.length > 0) {
      postMedia.forEach((media) => {
        electricPostMediaCollection.insert({
          ...media,
          id: Math.round(Math.random() * 1_000_000_000),
          postId: postId,
          width: media.width ?? 0,
          height: media.height ?? 0,
          createdAt: new Date(),
        });
      });
    }
  },
  mutationFn: async (postData) => {
    const response = await fetch(`/api/posts`, {
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

    await Promise.all([
      electricPostCollection.utils.awaitTxId(txid),
      electricPostMediaCollection.utils.awaitTxId(txid),
    ]);
  },
});

export const likePost = createOptimisticAction<InsertLike>({
  onMutate: ({ userId, postId }) => {
    electricLikeCollection.insert({
      userId,
      postId,
      createdAt: new Date(),
    });

    electricPostCollection.update(postId, (draft) => {
      draft.likeCount += 1;
    });
  },
  mutationFn: async ({ postId }) => {
    const response = await fetch(`/api/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
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
  onMutate: ({ userId, postId }) => {
    electricLikeCollection.delete(`${userId}-${postId}`);

    electricPostCollection.update(postId, (draft) => {
      draft.likeCount -= 1;
    });
  },
  mutationFn: async ({ postId }) => {
    const response = await fetch(`/api/likes?postId=${postId}`, {
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
