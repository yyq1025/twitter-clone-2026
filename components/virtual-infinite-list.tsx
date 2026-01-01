"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Fragment, type Key, type ReactNode, useEffect, useRef } from "react";

interface VirtualInfiniteListProps<T> {
  data: T[];
  hasNextPage: boolean;
  fetchNextPage: () => void | Promise<void>;
  isFetchingNextPage: boolean;
  isError: boolean;
  isLoading: boolean;
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => Key;
  estimateSize?: (index: number) => number;
  overscan?: number;
}

export default function VirtualInfiniteList<T>({
  data,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isError,
  isLoading,
  renderItem,
  getKey,
  estimateSize = () => 120,
  overscan = 5,
}: VirtualInfiniteListProps<T>) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useWindowVirtualizer({
    count: hasNextPage ? data.length + 1 : data.length,
    estimateSize,
    overscan,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    getItemKey: (index) =>
      index >= data.length ? "__loader__" : getKey(data[index], index),
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!items.length || !hasNextPage || isFetchingNextPage) {
      return;
    }
    const lastItem = items[items.length - 1];
    if (lastItem.index >= data.length - 1) {
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
            items.map((virtualRow) => (
              <Fragment key={virtualRow.key}>
                {virtualRow.index < data.length ? (
                  renderItem(data[virtualRow.index], virtualRow.index)
                ) : (
                  <div className="p-4 text-sm">Loading more...</div>
                )}
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
