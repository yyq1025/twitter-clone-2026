import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import {
  selectLikeSchema,
  selectPostMediaSchema,
  selectPostSchema,
  selectUserSchema,
} from "@/db/validation";
import { snakeCamelMapper } from "@electric-sql/client";

const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

export const electricPostCollection = createCollection(
  electricCollectionOptions({
    id: "posts",
    shapeOptions: {
      url: `${baseUrl}/api/posts`,
      columnMapper: snakeCamelMapper(),
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectPostSchema,
    getKey: (item) => item.id,
  }),
);

export const electricPostMediaCollection = createCollection(
  electricCollectionOptions({
    id: "post-media",
    shapeOptions: {
      url: `${baseUrl}/api/post-media`,
      columnMapper: snakeCamelMapper(),
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectPostMediaSchema,
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
    getKey: (item) => `${item.userId}-${item.postId}`,
  }),
);
