import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  selectFollowSchema,
  selectLikeSchema,
  selectPostSchema,
  selectUserSchema,
} from "@/db/validation";

const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

export const electricPostCollection = createCollection(
  electricCollectionOptions({
    id: "posts",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/posts`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectPostSchema,
    getKey: (item) => item.id,
  }),
);

export const electricUserCollection = createCollection(
  electricCollectionOptions({
    id: "users",
    shapeOptions: {
      url: `${baseUrl}/api/users`,
      columnMapper: snakeCamelMapper(),
    },
    schema: selectUserSchema,
    getKey: (item) => item.id,
  }),
);

export const electricLikeCollection = createCollection(
  electricCollectionOptions({
    id: "likes",
    shapeOptions: {
      url: `${baseUrl}/api/likes`,
      columnMapper: snakeCamelMapper(),
    },
    schema: selectLikeSchema,
    getKey: (item) => `${item.user_id}-${item.post_id}`,
  }),
);

export const electricFollowCollection = createCollection(
  electricCollectionOptions({
    id: "follows",
    shapeOptions: {
      url: `${baseUrl}/api/follows`,
      columnMapper: snakeCamelMapper(),
    },
    schema: selectFollowSchema,
    getKey: (item) => `${item.follower_id}-${item.following_id}`,
    onInsert: async ({ transaction }) => {
      const newItem = transaction.mutations[0].modified;
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: newItem.following_id,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create follow");
      }
      const { txid } = await response.json();
      return { txid };
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      const response = await fetch(
        `/api/follows?followingId=${original.following_id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete follow");
      }
      const { txid } = await response.json();
      return { txid };
    },
  }),
);
