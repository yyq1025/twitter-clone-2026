"use client";

import { eq, useLiveQuery } from "@tanstack/react-db";

import {
  electricPostCollection,
  electricUserCollection,
  electricLikeCollection,
  electricPostMediaCollection,
} from "@/lib/collections";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
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
      <div className="p-4 text-sm text-gray_text">加载帖子中，请稍候...</div>
    );
  }

  return <PostsList />;
}

function PostsList() {
  const { data: session } = authClient.useSession();
  const { data, isError } = useLiveQuery((q) =>
    q
      .from({ post: electricPostCollection })
      .join(
        { user: electricUserCollection },
        ({ post, user }) => eq(user.id, post.userId),
        "inner"
      )
      .orderBy(({ post }) => post.createdAt, "desc")
  );

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive">
        加载帖子时出错，请稍后再试。
      </div>
    );
  }

  if (!data.length) {
    return <div className="p-4 text-sm text-gray_text">暂无帖子</div>;
  }

  return (
    <div className="divide-y divide-border_color">
      {data.map(({ post, user }) => (
        <PostItem
          key={post.id}
          post={post}
          user={user}
          sessionUserId={session?.user?.id}
        />
      ))}
    </div>
  );
}
