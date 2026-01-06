import { useVirtualizer } from "@tanstack/react-virtual";
import { type Key, type ReactNode, useCallback, useEffect } from "react";
import { useVirtualizerContext } from "@/components/virtualizer-container";

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
  const { parentRef } = useVirtualizerContext();

  const getItemKey = useCallback(
    (index: number) =>
      index >= data.length ? "__loader__" : getKey(data[index], index),
    [data, getKey],
  );

  const virtualizer = useVirtualizer({
    getScrollElement: () => parentRef.current,
    count: hasNextPage ? data.length + 1 : data.length,
    estimateSize,
    overscan,
    getItemKey,
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

  if (isError) {
    return (
      <div className="p-4 text-destructive text-sm">
        Error loading posts. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 text-sm">Loading posts...</div>;
  }
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: `${virtualizer.getTotalSize()}px`,
      }}
    >
      {items.map((virtualRow) => (
        <div
          key={virtualRow.key}
          ref={virtualizer.measureElement}
          data-index={virtualRow.index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          {virtualRow.index < data.length ? (
            renderItem(data[virtualRow.index], virtualRow.index)
          ) : (
            <div className="p-4 text-sm">Loading more...</div>
          )}
        </div>
      ))}
    </div>
  );
}
