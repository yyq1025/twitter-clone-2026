import {
  and,
  createLiveQueryCollection,
  eq,
  gt,
  useLiveInfiniteQuery,
} from "@tanstack/react-db";
import { Fragment } from "react";
import { PostItem } from "@/components/post-item";
import { ViewFullThread } from "@/components/view-full-thread";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import {
  electricFeedItemCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function MediaFeed({ userId }: { userId: string }) {
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
        .from({ feed_item: electricFeedItemCollection })
        .innerJoin(
          { postWithUser: postsWithUser },
          ({ feed_item, postWithUser }) =>
            eq(feed_item.post_id, postWithUser.post.id),
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
        .where(({ feed_item, postWithUser }) =>
          and(
            eq(feed_item.creator_id, userId),
            and(
              eq(feed_item.type, "post"),
              gt(postWithUser.post.media_length, 0),
            ),
          ),
        )
        .orderBy(({ feed_item }) => feed_item.created_at, "desc")
        .select(
          ({
            feed_item,
            postWithUser: { post, user },
            reply_parent,
            reply_root,
          }) => ({
            feed_item,
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
        feed_item,
        post,
        user,
        reply_parent_post,
        reply_parent_user,
        reply_root_post,
        reply_root_user,
      }) => {
        if (feed_item.type === "repost") {
          return [{ feed_item, post, user }];
        }
        const post_slice = [];
        if (
          reply_root_post &&
          reply_root_user &&
          !seenPostIds.has(reply_root_post.id)
        ) {
          post_slice.push({
            feed_item,
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
            feed_item,
            post: reply_parent_post,
            user: reply_parent_user,
          });
          seenPostIds.add(reply_parent_post.id);
        }
        if (seenPostIds.has(post.id)) {
          return [];
        }
        post_slice.push({ feed_item, post, user });
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
      getKey={(item) => {
        const feedItem = item[item.length - 1].feed_item;
        return `${feedItem.creator_id}-${feedItem.type}-${feedItem.post_id}`;
      }}
      renderItem={(item) =>
        item.map(({ post, user }, idx) => (
          <Fragment key={post.id}>
            {idx > 0 &&
              idx < item.length - 1 &&
              post.reply_parent_id !== post.reply_root_id && (
                <ViewFullThread post={post} user={user} />
              )}
            <PostItem
              post={post}
              user={user}
              isRoot={idx === 0 && item.length > 1}
              isParent={idx > 0 && idx < item.length - 1}
              isChild={idx === item.length - 1 && item.length > 1}
            />
          </Fragment>
        ))
      }
    />
  );
}
