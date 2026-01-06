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

  return (
    <>
      {postData.post.reply_parent_id ? (
        <ParentThread
          postId={postData.post.reply_parent_id}
          onParentLoaded={onParentLoaded}
        />
      ) : null}
      <PostItem post={postData.post} user={postData.user} />
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
        .orderBy(({ post }) => post.created_at, "desc"),
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
    if (mainPostData && !mainPostData.post.reply_parent_id) {
      setParentsLoaded(true);
    }
  }, [mainPostData]);

  useEffect(() => {
    if (ref.current && parentsLoaded && postId === mainPostData?.post.id) {
      console.log("Scrolling into view");
      ref.current.scrollIntoView();
    }
  }, [parentsLoaded, postId, mainPostData]);

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
        <div ref={ref} className="scroll-mt-15">
          <PostItem post={mainPostData.post} user={mainPostData.user} />
        </div>

        <div className="border-gray-100 border-b">
          <PostComposer
            parentPost={mainPostData.post}
            parentUser={mainPostData.user}
          />
        </div>

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
