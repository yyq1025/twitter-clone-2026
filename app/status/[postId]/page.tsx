"use client";

import { StatusThread } from "@/components/status-thread";
import { use, useEffect, useState } from "react";
import {
  electricLikeCollection,
  electricPostCollection,
  electricPostMediaCollection,
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
      electricPostMediaCollection,
    ].every((col) => col.isReady())
  );

  useEffect(() => {
    if (collectionsLoaded) return;
    Promise.all(
      [
        electricPostCollection,
        electricUserCollection,
        electricLikeCollection,
        electricPostMediaCollection,
      ].map((col) => col.preload())
    ).then(() => setCollectionsLoaded(true));
  }, [collectionsLoaded]);

  if (!collectionsLoaded) {
    return null;
  }

  return <StatusThread postId={Number(postId)} />;
}
