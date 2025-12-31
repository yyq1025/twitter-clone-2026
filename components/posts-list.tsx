"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { PostItem } from "@/components/post-item";
import { authClient } from "@/lib/auth-client";
import type { SelectPost, SelectUser } from "@/lib/validators";

interface PostsListProps {
  data: {
    post: SelectPost;
    user?: SelectUser;
  }[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isError: boolean;
  isLoading: boolean;
}

export default function PostsList({
  data,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isError,
  isLoading,
}: PostsListProps) {
  const { data: session } = authClient.useSession();
  const listRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? data.length + 1 : data.length,
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
      lastItem.index >= data.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [items, hasNextPage, fetchNextPage, isFetchingNextPage, data.length]);

  return (
    <div ref={listRef}>
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
            <div className="p-4 text-destructive text-sm">
              Error loading posts. Please try again later.
            </div>
          ) : isLoading ? (
            <div className="p-4 text-sm">Loading posts...</div>
          ) : (
            items.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > data.length - 1;
              const { post, user } = isLoaderRow ? {} : data[virtualRow.index];
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
