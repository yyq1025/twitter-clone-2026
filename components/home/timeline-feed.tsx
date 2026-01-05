"use client";

import { and, eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import {
  electricFeedItemCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function TimelineFeed() {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({
          feed_item: electricFeedItemCollection,
        })
        .innerJoin({ post: electricPostCollection }, ({ feed_item, post }) =>
          eq(feed_item.post_id, post.id),
        )
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ feed_item, post }) =>
          and(eq(feed_item.type, "post"), isNull(post.reply_parent_id)),
        )
        .orderBy(({ feed_item }) => feed_item.created_at, "desc")
        .select(({ post, user }) => ({
          post,
          user,
        })),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
  );

  return (
    <VirtualInfiniteList
      data={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
      isLoading={isLoading}
      getKey={(item) => item.post.id}
      renderItem={(item) => <PostItem post={item.post} user={item.user} />}
    />
  );
}
