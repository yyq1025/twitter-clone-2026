import { eq, useLiveQuery } from "@tanstack/react-db";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";
import { PostComposer } from "./post-composer";
import { PostItem } from "./post-item";
import { ThreadAnchor } from "./post-thread/thread-anchor";

type ParentThreadProps = {
  postId: string;

  onParentLoaded?: () => void;
};

function ParentThread({
  postId,

  onParentLoaded,
}: ParentThreadProps) {
  const { data: postData } = useLiveQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ post }) => eq(post.id, postId))
        .findOne(),
    [postId],
  );

  useEffect(() => {
    if (postData && !postData.post.reply_parent_id) {
      onParentLoaded?.();
    }
  }, [postData, onParentLoaded]);

  if (!postData) {
    return null;
  }

  const isRoot = !postData.post.reply_parent_id;

  return (
    <>
      {postData.post.reply_parent_id && (
        <ParentThread
          postId={postData.post.reply_parent_id}
          onParentLoaded={onParentLoaded}
        />
      )}
      <PostItem
        post={postData.post}
        user={postData.user}
        isRoot={isRoot}
        isParent={!isRoot}
      />
    </>
  );
}

type PostThreadProps = {
  username: string;
  postId: string;
};

export function PostThread({ username, postId }: PostThreadProps) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const ref = useRef<HTMLDivElement | null>(null);
  const [parentsLoaded, setParentsLoaded] = useState(false);

  const { data: mainPostData, isLoading: isMainLoading } = useLiveQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ post }) => eq(post.id, postId))
        .findOne(),
    [postId],
  );

  const { data: replies, isLoading: isRepliesLoading } = useLiveQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.creator_id),
        )
        .where(({ post }) => eq(post.reply_parent_id, postId))
        .orderBy(({ post }) => post.created_at, "asc"),
    [postId],
  );

  useEffect(() => {
    if (
      !isMainLoading &&
      mainPostData?.user.username &&
      mainPostData.user.username !== username
    ) {
      router.navigate({
        to: "/profile/$username/post/$postId",
        params: { username: mainPostData.user.username, postId },
        replace: true,
      });
    }
  }, [isMainLoading, mainPostData, username, router, postId]);

  useEffect(() => {
    if (
      mainPostData?.post.id === postId &&
      !mainPostData.post.reply_parent_id
    ) {
      setParentsLoaded(true);
    }
  }, [mainPostData, postId]);

  useEffect(() => {
    if (ref.current && parentsLoaded && postId === mainPostData?.post.id) {
      ref.current.scrollIntoView();
    }
  }, [parentsLoaded, postId, mainPostData?.post.id]);

  if (isMainLoading || isPending) {
    return <div className="p-4 text-sm">Loading thread...</div>;
  }

  if (!mainPostData) {
    return (
      <div className="p-4 text-destructive text-sm">
        Post not found or has been removed.
      </div>
    );
  }

  return (
    <>
      {mainPostData.post.reply_parent_id && (
        <ParentThread
          postId={mainPostData.post.reply_parent_id}
          onParentLoaded={() => setParentsLoaded(true)}
        />
      )}

      <div className="min-h-screen">
        <div ref={ref} className="scroll-mt-15" />
        <ThreadAnchor post={mainPostData.post} user={mainPostData.user} />

        {isRepliesLoading ? (
          <div className="p-4 text-sm">Loading replies...</div>
        ) : (
          replies?.map(({ post, user }) => (
            <PostItem key={post.id} post={post} user={user} />
          ))
        )}
      </div>
    </>
  );
}
