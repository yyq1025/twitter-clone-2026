import {
  and,
  createLiveQueryCollection,
  eq,
  gt,
  useLiveInfiniteQuery,
} from "@tanstack/react-db";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import {
  electricFeedItemCollection,
  electricLikeCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function LikedPosts({ username }: { username: string }) {
  const postsWithUser = createLiveQueryCollection((q) =>
    q
      .from({
        post: electricPostCollection,
      })
      .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
        eq(user.id, post.creator_id),
      ),
  );

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
        .from({ like: electricLikeCollection })
        .innerJoin({ creator: electricUserCollection }, ({ like, creator }) =>
          eq(creator.id, like.user_id),
        )
        .innerJoin({ postWithUser: postsWithUser }, ({ like, postWithUser }) =>
          eq(like.post_id, postWithUser.post.id),
        )
        .leftJoin(
          { reply_parent: postsWithUser },
          ({ postWithUser, reply_parent }) =>
            eq(reply_parent.post.id, postWithUser.post.reply_parent_id),
        )
        .leftJoin(
          { reply_root: postsWithUser },
          ({ postWithUser, reply_root }) =>
            eq(reply_root.post.id, postWithUser.post.reply_root_id),
        )
        .where(({ creator }) => eq(creator.username, username))
        .orderBy(({ like }) => like.created_at, "desc")
        .select(
          ({ postWithUser: { post, user }, reply_parent, reply_root }) => ({
            post,
            user,
            reply_parent_post: reply_parent?.post,
            reply_parent_user: reply_parent?.user,
            reply_root_post: reply_root?.post,
            reply_root_user: reply_root?.user,
          }),
        ),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
  );

  // Feed dedup
  const seenPostIds = new Set<string>();
  const dedupedData = data
    .map(
      ({
        post,
        user,
        reply_parent_post,
        reply_parent_user,
        reply_root_post,
        reply_root_user,
      }) => {
        const post_slice = [];
        if (
          reply_root_post &&
          reply_root_user &&
          !seenPostIds.has(reply_root_post.id)
        ) {
          post_slice.push({
            post: reply_root_post,
            user: reply_root_user,
          });
          seenPostIds.add(reply_root_post.id);
        }
        if (
          reply_parent_post &&
          reply_parent_user &&
          !seenPostIds.has(reply_parent_post.id)
        ) {
          post_slice.push({
            post: reply_parent_post,
            user: reply_parent_user,
          });
          seenPostIds.add(reply_parent_post.id);
        }
        if (seenPostIds.has(post.id)) {
          return [];
        }
        post_slice.push({ post, user });
        seenPostIds.add(post.id);
        return post_slice;
      },
    )
    .filter((post_slice) => post_slice.length > 0);

  return (
    <VirtualInfiniteList
      data={dedupedData}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
      isLoading={isLoading}
      getKey={(item) => item[item.length - 1].post.id}
      renderItem={(item) =>
        item.map(({ post, user }, idx) => (
          <PostItem
            key={post.id}
            post={post}
            user={user}
            isRoot={idx === 0 && item.length > 1}
            isParent={idx > 0 && idx < item.length - 1}
            isChild={idx === item.length - 1 && item.length > 1}
          />
        ))
      }
    />
  );
}
