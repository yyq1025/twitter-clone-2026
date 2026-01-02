import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  selectFeedItemSchema,
  selectFollowSchema,
  selectLikeSchema,
  selectPostSchema,
  selectRepostSchema,
  selectUserSchema,
} from "@/lib/validators";

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

export const electricFeedItemCollection = createCollection(
  electricCollectionOptions({
    id: "feed_items",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/feed-items`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectFeedItemSchema,
    getKey: (item) => `${item.creator_id}-${item.type}-${item.post_id}`,
  }),
);

export const electricUserCollection = createCollection(
  electricCollectionOptions({
    id: "users",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/users`,
      columnMapper: snakeCamelMapper(),
      parser: {
        timestamp: (date: string) => new Date(date),
      },
    },
    schema: selectUserSchema,
    getKey: (item) => item.id,
  }),
);

export const electricLikeCollection = createCollection(
  electricCollectionOptions({
    id: "likes",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/likes`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectLikeSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricRepostCollection = createCollection(
  electricCollectionOptions({
    id: "reposts",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/reposts`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectRepostSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricFollowCollection = createCollection(
  electricCollectionOptions({
    id: "follows",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/follows`,
    },
    schema: selectFollowSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);
