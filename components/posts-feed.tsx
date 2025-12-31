"use client";

import { and, eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { omit } from "lodash-es";
import AuthGuard from "@/components/auth-guard";
import { PostComposer } from "@/components/post-composer";
import PostsList from "@/components/posts-list";
import {
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function PostsFeed() {
  const {
    data: posts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({
          post: electricPostCollection,
        })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.author_id),
        )
        .where(({ post }) => isNull(post.reply_to_id))
        .orderBy(({ post }) => post.created_at, "desc"),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
  );

  return (
    <>
      <AuthGuard>
        <div className="hidden border-gray-100 border-b sm:flex">
          <PostComposer />
        </div>
      </AuthGuard>
      <PostsList
        data={posts}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        isLoading={isLoading}
      />
    </>
  );
}
