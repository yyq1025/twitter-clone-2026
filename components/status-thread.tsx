"use client";

import type * as z from "zod";
import type { selectPostSchema, selectUserSchema } from "@/db/validation";
import { authClient } from "@/lib/auth-client";
import { PostItem } from "./post-item";
import {
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";
import { PostComposer } from "./post-composer";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useEffect, useRef, useState } from "react";

type ParentThreadProps = {
  postId: number;
  sessionUserId?: string;
  onParentLoaded?: () => void;
};

function ParentThread({
  postId,
  sessionUserId,
  onParentLoaded,
}: ParentThreadProps) {
  const { data: postData } = useLiveQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.userId)
        )
        .where(({ post }) => eq(post.id, postId))
        .findOne(),
    [postId]
  );

  useEffect(() => {
    if (postData && !postData.post.replyToId) {
      onParentLoaded?.();
    }
  }, [postData, onParentLoaded]);

  if (!postData) {
    return null;
  }

  return (
    <>
      {postData.post.replyToId ? (
        <ParentThread
          postId={postData.post.replyToId}
          sessionUserId={sessionUserId}
          onParentLoaded={onParentLoaded}
        />
      ) : null}
      <PostItem
        post={postData.post}
        user={postData.user}
        sessionUserId={sessionUserId}
      />
    </>
  );
}

type StatusThreadProps = {
  postId: number;
};

export function StatusThread({ postId }: StatusThreadProps) {
  const { data: session, isPending } = authClient.useSession();
  const ref = useRef<HTMLDivElement | null>(null);
  const [parentsLoaded, setParentsLoaded] = useState(false);

  const { data: mainPostData, isLoading: isMainLoading } = useLiveQuery((q) =>
    q
      .from({ post: electricPostCollection })
      .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
        eq(user.id, post.userId)
      )
      .where(({ post }) => eq(post.id, postId))
      .findOne()
  );

  const { data: replies, isLoading: isRepliesLoading } = useLiveQuery((q) =>
    q
      .from({ post: electricPostCollection })
      .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
        eq(user.id, post.userId)
      )
      .where(({ post }) => eq(post.replyToId, postId))
      .orderBy(({ post }) => post.createdAt, "desc")
  );

  useEffect(() => {
    if (mainPostData && !mainPostData.post.replyToId) {
      setParentsLoaded(true);
    }
  }, [mainPostData]);

  useEffect(() => {
    if (ref.current && parentsLoaded) {
      ref.current.scrollIntoView();
    }
  }, [parentsLoaded]);

  if (isMainLoading || isPending) {
    return <div className="p-4 text-sm">Loading conversation...</div>;
  }

  if (!mainPostData) {
    return (
      <div className="p-4 text-sm text-destructive">
        Post not found or has been removed.
      </div>
    );
  }

  return (
    <>
      {mainPostData.post.replyToId ? (
        <ParentThread
          postId={mainPostData.post.replyToId}
          sessionUserId={session?.user?.id}
          onParentLoaded={() => setParentsLoaded(true)}
        />
      ) : null}

      <div className="min-h-screen">
        <div ref={ref} className="scroll-mt-15">
          <PostItem
            post={mainPostData.post}
            user={mainPostData.user}
            sessionUserId={session?.user?.id}
          />
        </div>

        <div className="border-b border-gray-100">
          <PostComposer
            parentPost={mainPostData.post}
            parentUser={mainPostData.user}
          />
        </div>

        {isRepliesLoading ? (
          <div className="p-4 text-sm">Loading replies...</div>
        ) : (
          replies?.map(({ post, user }) => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              sessionUserId={session?.user?.id}
            />
          ))
        )}
      </div>
    </>
  );
}
