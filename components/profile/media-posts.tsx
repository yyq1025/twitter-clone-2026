import { and, eq, gt, useLiveInfiniteQuery } from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import { authClient } from "@/lib/auth-client";
import {
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function MediaPosts({ username }: { username: string }) {
  const { data: session } = authClient.useSession();
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
          eq(user.id, post.creator_id),
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
