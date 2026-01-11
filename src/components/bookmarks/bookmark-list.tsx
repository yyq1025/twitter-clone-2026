import { eq, useLiveInfiniteQuery } from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import {
  electricBookmarkCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 50;

export default function BookmarkList({ userId }: { userId: string }) {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({ bookmark: electricBookmarkCollection })
        .where(({ bookmark }) => eq(bookmark.creator_id, userId))
        .innerJoin({ post: electricPostCollection }, ({ bookmark, post }) =>
          eq(bookmark.subject_id, post.id),
        )
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(post.creator_id, user.id),
        )
        .orderBy(({ bookmark }) => bookmark.created_at, "desc"),
    {
      pageSize,
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
      isLoading={isLoading}
      isError={isError}
      getKey={({ bookmark }) => `${bookmark.creator_id}-${bookmark.subject_id}`}
      renderItem={({ post, user }) => <PostItem post={post} user={user} />}
    />
  );
}
