import { createOptimisticAction } from "@tanstack/react-db";
import type { InsertLike, InsertPost } from "@/db/validation";
import {
  electricLikeCollection,
  electricPostCollection,
} from "@/lib/collections";

export const createPost = async (postData: InsertPost) => {
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
};

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
    const response = await fetch("/api/likes", {
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
