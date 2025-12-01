"use client";

import {
  eq,
  isNull,
  useLiveInfiniteQuery,
  useLiveQuery,
} from "@tanstack/react-db";
import {
  electricPostCollection,
  electricUserCollection,
  electricLikeCollection,
} from "@/lib/collections";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PostItem } from "@/components/post-item";
import { PostComposer } from "@/components/post-composer";
import AuthGuard from "@/components/auth-guard";
import { useRouter } from "next/navigation";

export default function PostsList() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const {
    pages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.userId)
        )
        .where(({ post }) => isNull(post.replyToId))
        .orderBy(({ post }) => post.createdAt, "desc"),
    {
      pageSize: 20,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 20 ? allPages.length : undefined,
    }
  );

  const posts = pages.flat();

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
            transform: `translateY(${items[0]?.start ?? 0}px)`,
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
              const { post, user } = posts[virtualRow.index] || {};
              return (
                <div
                  data-index={virtualRow.index}
                  key={isLoaderRow ? "loader" : post.id}
                  ref={virtualizer.measureElement}
                >
                  {isLoaderRow ? (
                    <div className="p-4 text-sm">Loading more posts...</div>
                  ) : (
                    <PostItem
                      post={post}
                      user={user}
                      sessionUserId={session?.user?.id}
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
