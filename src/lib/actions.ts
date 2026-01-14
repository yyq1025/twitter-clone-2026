import { createOptimisticAction } from "@tanstack/react-db";
import {
  electricBookmarkCollection,
  electricFeedItemCollection,
  electricFollowCollection,
  electricLikeCollection,
  electricPostCollection,
  electricRepostCollection,
  electricUserCollection,
} from "@/lib/collections";
import type { InsertPost } from "@/lib/validators";
import {
  safeAwaitTxId,
  safeDelete,
  safeInsert,
  safeSingleUpdate,
} from "@/utils/collection";

export const createPost = createOptimisticAction<{
  payload: InsertPost;
  userId: string;
}>({
  onMutate: ({ payload, userId }) => {
    safeInsert(electricPostCollection, {
      ...payload,
      id: payload.id,
      creator_id: userId,
      media: payload.media || [],
      media_length: payload.media?.length || 0,
      created_at: new Date(),
      like_count: 0,
      repost_count: 0,
      bookmark_count: 0,
      reply_count: 0,
      reply_root_id: payload.reply_root_id || null,
      reply_parent_id: payload.reply_parent_id || null,
      quote_id: payload.quote_id || null,
    });

    safeInsert(electricFeedItemCollection, {
      type: "post",
      creator_id: userId,
      post_id: payload.id,
      created_at: new Date(),
    });

    safeSingleUpdate(electricUserCollection, userId, (draft) => {
      draft.postsCount = (draft.postsCount || 0) + 1;
    });

    if (payload.reply_parent_id) {
      safeSingleUpdate(
        electricPostCollection,
        payload.reply_parent_id,
        (draft) => {
          draft.reply_count += 1;
        },
      );
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
      safeAwaitTxId(electricPostCollection, txid),
      safeAwaitTxId(electricFeedItemCollection, txid),
    ]);
  },
});

export const mutateLike = createOptimisticAction<{
  type: "post.like" | "post.unlike";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "post.like") {
      safeInsert(electricLikeCollection, {
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.like_count += 1;
      });
    } else if (type === "post.unlike") {
      safeDelete(electricLikeCollection, `${userId}-${payload.subject_id}`);

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.like_count -= 1;
      });
    }
  },
  mutationFn: async ({ type, payload }) => {
    const response = await fetch(`/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        payload,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to ${type === "post.like" ? "like" : "unlike"} post`,
      );
    }
    const { txid } = await response.json();

    await Promise.all([
      safeAwaitTxId(electricLikeCollection, txid),
      safeAwaitTxId(electricPostCollection, txid),
    ]);
  },
});

export const mutateRepost = createOptimisticAction<{
  type: "post.repost" | "post.unrepost";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "post.repost") {
      safeInsert(electricRepostCollection, {
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.repost_count += 1;
      });

      safeInsert(electricFeedItemCollection, {
        type: "repost",
        creator_id: userId,
        post_id: payload.subject_id,
        created_at: new Date(),
      });
    } else if (type === "post.unrepost") {
      safeDelete(electricRepostCollection, `${userId}-${payload.subject_id}`);

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.repost_count -= 1;
      });

      safeDelete(
        electricFeedItemCollection,
        `${userId}-repost-${payload.subject_id}`,
      );
    }
  },
  mutationFn: async ({ type, payload }) => {
    const response = await fetch(`/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        payload,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to ${type === "post.repost" ? "repost" : "unrepost"} post`,
      );
    }
    const { txid } = await response.json();

    await Promise.all([
      safeAwaitTxId(electricRepostCollection, txid),
      safeAwaitTxId(electricPostCollection, txid),
      safeAwaitTxId(electricFeedItemCollection, txid),
    ]);
  },
});

export const mutateBookmark = createOptimisticAction<{
  type: "post.bookmark" | "post.unbookmark";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "post.bookmark") {
      safeInsert(electricBookmarkCollection, {
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.bookmark_count += 1;
      });
    } else if (type === "post.unbookmark") {
      safeDelete(electricBookmarkCollection, `${userId}-${payload.subject_id}`);

      safeSingleUpdate(electricPostCollection, payload.subject_id, (draft) => {
        draft.bookmark_count -= 1;
      });
    }
  },
  mutationFn: async ({ type, payload }) => {
    const response = await fetch(`/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        payload,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to ${
          type === "post.bookmark" ? "bookmark" : "unbookmark"
        } post`,
      );
    }
    const { txid } = await response.json();

    await Promise.all([
      safeAwaitTxId(electricBookmarkCollection, txid),
      safeAwaitTxId(electricPostCollection, txid),
    ]);
  },
});

export const mutateFollow = createOptimisticAction<{
  type: "user.follow" | "user.unfollow";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "user.follow") {
      safeInsert(electricFollowCollection, {
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      safeSingleUpdate(electricUserCollection, payload.subject_id, (draft) => {
        draft.followersCount = (draft.followersCount || 0) + 1;
      });
      safeSingleUpdate(electricUserCollection, userId, (draft) => {
        draft.followsCount = (draft.followsCount || 0) + 1;
      });
    } else if (type === "user.unfollow") {
      safeDelete(electricFollowCollection, `${userId}-${payload.subject_id}`);

      safeSingleUpdate(electricUserCollection, payload.subject_id, (draft) => {
        draft.followersCount = (draft.followersCount || 1) - 1;
      });

      safeSingleUpdate(electricUserCollection, userId, (draft) => {
        draft.followsCount = (draft.followsCount || 1) - 1;
      });
    }
  },
  mutationFn: async ({ type, payload }) => {
    const response = await fetch(`/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        payload,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to ${type === "user.follow" ? "follow" : "unfollow"} user`,
      );
    }
    const { txid } = await response.json();

    await Promise.all([
      safeAwaitTxId(electricFollowCollection, txid),
      safeAwaitTxId(electricUserCollection, txid),
    ]);
  },
});
