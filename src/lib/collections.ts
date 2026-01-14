import { FetchError, snakeCamelMapper } from "@electric-sql/client";
import {
  type ElectricCollectionUtils,
  electricCollectionOptions,
} from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import {
  selectBookmarkSchema,
  selectFeedItemSchema,
  selectFollowSchema,
  selectLikeSchema,
  selectNotificationSchema,
  selectPostSchema,
  selectRepostSchema,
  selectUserSchema,
} from "@/lib/validators";

const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

export const electricPostCollection = createCollection<
  typeof selectPostSchema,
  string | number,
  ElectricCollectionUtils
>(
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

export const electricFeedItemCollection = createCollection<
  typeof selectFeedItemSchema,
  string | number,
  ElectricCollectionUtils
>(
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

export const electricUserCollection = createCollection<
  typeof selectUserSchema,
  string | number,
  ElectricCollectionUtils
>(
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

export const electricLikeCollection = createCollection<
  typeof selectLikeSchema,
  string | number,
  ElectricCollectionUtils
>(
  electricCollectionOptions({
    id: "likes",
    shapeOptions: {
      url: `${baseUrl}/api/likes`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
      onError: (error) => {
        console.error("Error in electricLikeCollection:", error);
        if (error instanceof FetchError) {
          return;
        }
      },
    },
    schema: selectLikeSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricRepostCollection = createCollection<
  typeof selectRepostSchema,
  string | number,
  ElectricCollectionUtils
>(
  electricCollectionOptions({
    id: "reposts",
    shapeOptions: {
      url: `${baseUrl}/api/reposts`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
      onError: (error) => {
        console.error("Error in electricRepostCollection:", error);
        if (error instanceof FetchError) {
          return;
        }
      },
    },
    schema: selectRepostSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricBookmarkCollection = createCollection<
  typeof selectBookmarkSchema,
  string | number,
  ElectricCollectionUtils
>(
  electricCollectionOptions({
    id: "bookmarks",
    shapeOptions: {
      url: `${baseUrl}/api/bookmarks`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectBookmarkSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricFollowCollection = createCollection<
  typeof selectFollowSchema,
  string | number,
  ElectricCollectionUtils
>(
  electricCollectionOptions({
    id: "follows",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/follows`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectFollowSchema,
    getKey: (item) => `${item.creator_id}-${item.subject_id}`,
  }),
);

export const electricNotificationCollection = createCollection<
  typeof selectNotificationSchema,
  string | number,
  ElectricCollectionUtils
>(
  electricCollectionOptions({
    id: "notifications",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/notifications`,
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectNotificationSchema,
    getKey: (item) => `${item.id}`,
  }),
);
