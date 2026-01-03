"use client";

import { and, eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import { follows } from "@/db/schema/follow-schema";
import { authClient } from "@/lib/auth-client";
import {
  electricFeedItemCollection,
  electricFollowCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function FollowingFeed() {
  const { data: session } = authClient.useSession();
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
        .from({ follow: electricFollowCollection })
        .innerJoin(
          { feed_item: electricFeedItemCollection },
          ({ follow, feed_item }) =>
            eq(follow.subject_id, feed_item.creator_id),
        )
        .innerJoin({ post: electricPostCollection }, ({ feed_item, post }) =>
          eq(feed_item.post_id, post.id),
        )
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ follow, post }) =>
          and(
            eq(follow.creator_id, session?.user?.id),
            isNull(post.reply_parent_id),
          ),
        )
        .orderBy(({ feed_item }) => feed_item.created_at, "desc")
        .select(({ feed_item, post, user }) => ({
          feed_item,
          post,
          user,
        })),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [session?.user?.id],
  );

  // const seenPostIds = new Set<string>();
  // const dedupedData = data?.filter((item) => {
  //   if (seenPostIds.has(item.post.id)) {
  //     return false;
  //   } else {
  //     seenPostIds.add(item.post.id);
  //     return true;
  //   }
  // });

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
