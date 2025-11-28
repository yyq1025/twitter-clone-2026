import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import {
  selectLikeSchema,
  selectPostMediaSchema,
  selectPostSchema,
  selectUserSchema,
} from "@/db/validation";
import { snakeCamelMapper } from "@electric-sql/client";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const electricPostCollection = createCollection(
  electricCollectionOptions({
    id: "posts",
    syncMode: "progressive",
    shapeOptions: {
      url: `${baseUrl}/api/posts`,
      columnMapper: snakeCamelMapper(),
      // transformer: (row) => ({
      //   ...row,
      //   user_id: row.userId,
      // }),
      parser: {
        timestamptz: (date: string) => new Date(date),
      },
    },
    schema: selectPostSchema,
    getKey: (item) => item.id,
    // onInsert: async ({ transaction }) => {
    //   const {
    //     id: _id,
    //     createdAt: _f,
    //     ...modefied
    //   } = transaction.mutations[0].modified;
    //   const response = await fetch("/api/posts", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(modefied),
    //   });
    //   if (!response.ok) {
    //     throw new Error("Failed to create post");
    //   }
    //   return { txid: (await response.json()).txid };
    // },
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
