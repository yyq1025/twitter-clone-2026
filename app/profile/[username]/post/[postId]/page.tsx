"use client";

import { Activity, use, useEffect, useState } from "react";
import { PostThread } from "@/components/post-thread";
import { electricUserCollection } from "@/lib/collections";

export const dynamic = "force-dynamic";

export default function StatusPage({
  params,
}: {
  params: Promise<{ username: string; postId: string }>;
}) {
  const { username, postId } = use(params);
  const [collectionsLoaded, setCollectionsLoaded] = useState(
    [electricUserCollection].every((col) => col.isReady()),
  );

  useEffect(() => {
    if (collectionsLoaded) return;
    Promise.all([electricUserCollection].map((col) => col.preload())).then(() =>
      setCollectionsLoaded(true),
    );
  }, [collectionsLoaded]);

  return (
    <Activity mode={collectionsLoaded ? "visible" : "hidden"}>
      <PostThread username={username} postId={postId} />
    </Activity>
  );
}
