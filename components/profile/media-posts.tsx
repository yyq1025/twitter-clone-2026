import { and, eq, gt, useLiveInfiniteQuery } from "@tanstack/react-db";
import PostsList from "@/components/posts-list";
import {
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function MediaPosts({ username }: { username: string }) {
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
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.author_id),
        )
        .where(({ post, user }) =>
          and(eq(user.username, username), gt(post.media_length, 0)),
        )
        .orderBy(({ post }) => post.created_at, "desc"),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [username],
  );

  return (
    <PostsList
      data={data}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
}
