"use client";

import { eq, useLiveQuery } from "@tanstack/react-db";

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

export default function PostsFeed() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      electricUserCollection.preload(),
      electricPostCollection.preload(),
      electricLikeCollection.preload(),
      electricPostMediaCollection.preload(),
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray_text">Loading posts, please wait...</div>
    );
  }

  return <PostsList />;
}

function PostsList() {
  const { data: session } = authClient.useSession();
  const { data = [], isError } = useLiveQuery((q) =>
    q
      .from({ post: electricPostCollection })
      .join(
        { user: electricUserCollection },
        ({ post, user }) => eq(user.id, post.userId),
        "inner"
      )
      .orderBy(({ post }) => post.createdAt, "desc")
  );
  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 8,
  });

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error loading posts. Please try again later.
      </div>
    );
  }

  if (!data.length) {
    return <div className="p-4 text-sm text-gray_text">No posts yet</div>;
  }

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const { post, user } = data[virtualRow.index];

          return (
            <div
              key={post.id}
              ref={virtualRow.measureElement}
              className="absolute left-0 top-0 w-full border-b border-border_color"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
              }}
            >
              <PostItem
                post={post}
                user={user}
                sessionUserId={session?.user?.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
