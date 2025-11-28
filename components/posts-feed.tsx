"use client";

import { eq, useLiveInfiniteQuery, useLiveQuery } from "@tanstack/react-db";
import {
  electricPostCollection,
  electricUserCollection,
  electricLikeCollection,
  electricPostMediaCollection,
} from "@/lib/collections";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PostItem } from "./post-item";
import { IconPhoto } from "@tabler/icons-react";

export default function PostsFeed() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      electricUserCollection.preload(),
      electricLikeCollection.preload(),
      electricPostMediaCollection.preload(),
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 text-sm">Loading posts, please wait...</div>;
  }

  return <PostsList />;
}

function PostsList() {
  const { data: session } = authClient.useSession();
  const { pages, hasNextPage, fetchNextPage, isFetchingNextPage, isError } =
    useLiveInfiniteQuery(
      (q) =>
        q
          .from({ post: electricPostCollection })
          .join(
            { user: electricUserCollection },
            ({ post, user }) => eq(user.id, post.userId),
            "inner"
          )
          .orderBy(({ post }) => post.createdAt, "desc"),
      {
        pageSize: 20,
        getNextPageParam: (lastPage, allPages) =>
          lastPage.length === 20 ? allPages.length : undefined,
      }
    );

  const posts = pages.flat();

  const { data: userLikes } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) {
        return null;
      }
      return q
        .from({ like: electricLikeCollection })
        .where(({ like }) => eq(like.userId, session.user.id));
    },
    [session?.user?.id]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
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
    <div ref={parentRef} className="h-full overflow-y-auto contain-strict">
      <div className="hidden sm:flex p-4 border-b border-gray-100 gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0"></div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="What's happening?"
            className="w-full bg-transparent text-xl outline-none mb-4"
          />
          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <div className="flex gap-4 text-blue-500">
              <IconPhoto className="size-5" />
            </div>
            <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold opacity-50 cursor-not-allowed">
              Post
            </button>
          </div>
        </div>
      </div>
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {isError ? (
            <div className="p-4 text-sm text-destructive">
              Error loading posts. Please try again later.
            </div>
          ) : !posts.length ? (
            <div className="p-4 text-sm">No posts yet</div>
          ) : (
            items.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > posts.length - 1;
              const { post, user } = posts[virtualRow.index] || {};
              return (
                <div
                  data-index={virtualRow.index}
                  key={isLoaderRow ? "loader" : post.id}
                  ref={virtualizer.measureElement}
                  className="border-b border-gray-100"
                >
                  {isLoaderRow ? (
                    <div className="p-4 text-sm">Loading more posts...</div>
                  ) : (
                    <PostItem
                      post={post}
                      user={user}
                      sessionUserId={session?.user?.id}
                      userLikes={userLikes}
                    />
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
