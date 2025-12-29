"use client";

import {
  eq,
  type InitialQueryBuilder,
  isNull,
  useLiveInfiniteQuery,
} from "@tanstack/react-db";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Activity, useEffect, useRef, useState } from "react";
import AuthGuard from "@/components/auth-guard";
import { PostComposer } from "@/components/post-composer";
import { PostItem } from "@/components/post-item";
import { authClient } from "@/lib/auth-client";
import {
  electricLikeCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const pageSize = 20;

export default function PostsFeed() {
  const [collectionsLoaded, setCollectionsLoaded] = useState(
    [electricLikeCollection].every((col) => col.isReady()),
  );

  useEffect(() => {
    if (collectionsLoaded) return;
    Promise.all([electricLikeCollection].map((col) => col.preload())).then(() =>
      setCollectionsLoaded(true),
    );
  }, [collectionsLoaded]);

  return (
    <Activity mode={collectionsLoaded ? "visible" : "hidden"}>
      <PostsList />
    </Activity>
  );
}

function PostsList() {
  const { data: session } = authClient.useSession();
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
          eq(user.id, post.user_id),
        )
        .where(({ post }) => isNull(post.reply_to_id))
        .orderBy(({ post }) => post.created_at, "desc"),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
  );

  const listRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length,
    estimateSize: () => 120,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!items.length) {
      return;
    }
    const lastItem = items[items.length - 1];
    if (
      lastItem.index >= posts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [items, hasNextPage, fetchNextPage, isFetchingNextPage, posts.length]);

  return (
    <div ref={listRef}>
      <AuthGuard>
        <div className="hidden sm:flex border-b border-gray-100">
          <PostComposer />
        </div>
      </AuthGuard>
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${
              items[0]?.start - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {isError ? (
            <div className="p-4 text-sm text-destructive">
              Error loading posts. Please try again later.
            </div>
          ) : isLoading ? (
            <div className="p-4 text-sm">Loading posts...</div>
          ) : (
            items.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > posts.length - 1;
              const { post, user } = isLoaderRow ? {} : posts[virtualRow.index];
              return (
                <div
                  data-index={virtualRow.index}
                  key={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  {post ? (
                    <PostItem
                      post={post}
                      user={user}
                      sessionUserId={session?.user?.id}
                    />
                  ) : (
                    <div className="p-4 text-sm">Loading more posts...</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
