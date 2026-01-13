import { IconRepeat } from "@tabler/icons-react";
import { eq, isNull, useLiveInfiniteQuery } from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";

import {
  electricFeedItemCollection,
  electricFollowCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function FollowingFeed({ userId }: { userId: string }) {
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
        .where(({ follow }) => eq(follow.creator_id, userId))
        .innerJoin(
          { feed_item: electricFeedItemCollection },
          ({ follow, feed_item }) =>
            eq(follow.subject_id, feed_item.creator_id),
        )
        .innerJoin(
          { feed_creator: electricUserCollection },
          ({ feed_item, feed_creator }) =>
            eq(feed_item.creator_id, feed_creator.id),
        )
        .innerJoin({ post: electricPostCollection }, ({ feed_item, post }) =>
          eq(feed_item.post_id, post.id),
        )
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ post }) => isNull(post.reply_parent_id))
        .orderBy(({ feed_item }) => feed_item.created_at, "desc")
        .select(({ feed_item, feed_creator, post, user }) => ({
          feed_item,
          feed_creator,
          post,
          user,
        })),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [userId],
  );

  return (
    <VirtualInfiniteList
      data={data}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
      isLoading={isLoading}
      getKey={(item) =>
        `${item.feed_item.creator_id}-${item.feed_item.type}-${item.feed_item.post_id}`
      }
      renderItem={(item) => (
        <PostItem
          feedReason={
            item.feed_item.type === "repost" && (
              <div className="mt-2 mb-1 flex gap-2">
                <div className="w-10">
                  <IconRepeat className="ml-auto size-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground text-sm leading-none">
                  Reposted by {item.feed_creator.name}
                </span>
              </div>
            )
          }
          post={item.post}
          user={item.user}
        />
      )}
    />
  );
}
