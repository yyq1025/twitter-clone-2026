import { createOptimisticAction } from "@tanstack/react-db";
import { asyncDebounce } from "@tanstack/react-pacer";
import {
  electricFeedItemCollection,
  electricFollowCollection,
  electricLikeCollection,
  electricPostCollection,
  electricRepostCollection,
  electricUserCollection,
} from "@/lib/collections";
import type { InsertPost } from "@/lib/validators";

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
    electricUserCollection.update(userId, (draft) => {
      draft.postsCount = (draft.postsCount || 0) + 1;
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

const debouncedLikeMutation = asyncDebounce(
  async ({
    type,
    payload,
  }: {
    type: "post.like" | "post.unlike";
    payload: { subject_id: string };
  }) => {
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
    return txid;
  },
  {
    wait: 500,
    onError: (error) => {
      console.error("Debounced like mutation error:", error);
    },
  },
);

export const mutateLike = createOptimisticAction<{
  type: "post.like" | "post.unlike";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "post.like") {
      electricLikeCollection.insert({
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      electricPostCollection.update(payload.subject_id, (draft) => {
        draft.like_count += 1;
      });
    } else if (type === "post.unlike") {
      electricLikeCollection.delete(`${userId}-${payload.subject_id}`);

      electricPostCollection.update(payload.subject_id, (draft) => {
        draft.like_count -= 1;
      });
    }
  },
  mutationFn: async ({ type, payload }) => {
    const txid = await debouncedLikeMutation({ type, payload });

    await Promise.all([
      electricLikeCollection.utils.awaitTxId(txid),
      electricPostCollection.utils.awaitTxId(txid),
    ]);
  },
});

const debouncedRepostMutation = asyncDebounce(
  async ({
    type,
    payload,
  }: {
    type: "post.repost" | "post.unrepost";
    payload: { subject_id: string };
  }) => {
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
    return txid;
  },
  {
    wait: 500,
    onError: (error) => {
      console.error("Debounced repost mutation error:", error);
    },
  },
);

export const mutateRepost = createOptimisticAction<{
  type: "post.repost" | "post.unrepost";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "post.repost") {
      electricRepostCollection.insert({
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });

      electricPostCollection.update(payload.subject_id, (draft) => {
        draft.repost_count += 1;
      });

      electricFeedItemCollection.insert({
        type: "repost",
        creator_id: userId,
        post_id: payload.subject_id,
        created_at: new Date(),
      });
    } else if (type === "post.unrepost") {
      electricRepostCollection.delete(`${userId}-${payload.subject_id}`);

      electricPostCollection.update(payload.subject_id, (draft) => {
        draft.repost_count -= 1;
      });

      electricFeedItemCollection.delete(
        `${userId}-repost-${payload.subject_id}`,
      );
    }
  },
  mutationFn: async ({ type, payload }) => {
    const txid = await debouncedRepostMutation({ type, payload });

    await Promise.all([
      electricRepostCollection.utils.awaitTxId(txid),
      electricPostCollection.utils.awaitTxId(txid),
      electricFeedItemCollection.utils.awaitTxId(txid),
    ]);
  },
});

const debouncedFollowMutation = asyncDebounce(
  async ({
    type,
    payload,
  }: {
    type: "user.follow" | "user.unfollow";
    payload: { subject_id: string };
  }) => {
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
    return txid;
  },
  {
    wait: 500,
    onError: (error) => {
      console.error("Debounced follow mutation error:", error);
    },
  },
);

export const mutateFollow = createOptimisticAction<{
  type: "user.follow" | "user.unfollow";
  payload: { subject_id: string };
  userId: string;
}>({
  onMutate: ({ type, payload, userId }) => {
    if (type === "user.follow") {
      electricFollowCollection.insert({
        creator_id: userId,
        subject_id: payload.subject_id,
        created_at: new Date(),
      });
      electricUserCollection.update(payload.subject_id, (draft) => {
        draft.followersCount = (draft.followersCount || 0) + 1;
      });
      electricUserCollection.update(userId, (draft) => {
        draft.followsCount = (draft.followsCount || 0) + 1;
      });
    } else if (type === "user.unfollow") {
      electricFollowCollection.delete(`${userId}-${payload.subject_id}`);

      electricUserCollection.update(payload.subject_id, (draft) => {
        draft.followersCount = (draft.followersCount || 1) - 1;
      });

      electricUserCollection.update(userId, (draft) => {
        draft.followsCount = (draft.followsCount || 1) - 1;
      });
    }
  },
  mutationFn: async ({ type, payload }) => {
    const txid = await debouncedFollowMutation({ type, payload });

    await Promise.all([
      electricFollowCollection.utils.awaitTxId(txid),
      electricUserCollection.utils.awaitTxId(txid),
    ]);
  },
});
