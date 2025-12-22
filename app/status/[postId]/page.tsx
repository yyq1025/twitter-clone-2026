"use client";

import { use, useEffect, useState } from "react";
import { StatusThread } from "@/components/status-thread";
import {
  electricLikeCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

export default function StatusPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const postId = use(params).postId;
  const [collectionsLoaded, setCollectionsLoaded] = useState(
    [
      electricPostCollection,
      electricUserCollection,
      electricLikeCollection,
    ].every((col) => col.isReady())
  );

  useEffect(() => {
    if (collectionsLoaded) return;
    Promise.all(
      [
        electricPostCollection,
        electricUserCollection,
        electricLikeCollection,
      ].map((col) => col.preload())
    ).then(() => setCollectionsLoaded(true));
  }, [collectionsLoaded]);

  if (!collectionsLoaded) {
    return null;
  }

  return <StatusThread postId={Number(postId)} />;
}
