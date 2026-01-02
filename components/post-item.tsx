"use client";

import { Button } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import {
  IconBookmark,
  IconDotsVertical,
  IconHeart,
  IconMessage,
  IconRepeat,
  IconShare2,
} from "@tabler/icons-react";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { likePost, unlikePost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { electricLikeCollection } from "@/lib/collections";
import { cn } from "@/lib/utils";
import type { SelectPost, SelectUser } from "@/lib/validators";

function formatPostTime(value: Date | string | number | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

type PostItemProps = {
  post: SelectPost;
  user: SelectUser;
  isRoot?: boolean;
  isParent?: boolean;
  isChild?: boolean;
};

export function PostItem({
  post,
  user,
  isRoot = false,
  isParent = false,
  isChild = false,
}: PostItemProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: userLiked } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) return null;
      return q
        .from({ like: electricLikeCollection })
        .where(({ like }) =>
          and(eq(like.post_id, post.id), eq(like.user_id, session.user.id)),
        )
        .findOne();
    },
    [session?.user?.id, post.id],
  );

  const handleLikeClick = () => {
    if (!session?.user?.id) return;
    if (userLiked) {
      unlikePost({
        userId: session.user.id,
        payload: { post_id: post.id },
      });
    } else {
      likePost({
        userId: session.user.id,
        payload: { post_id: post.id },
      });
    }
  };

  return (
    <>
      {isParent && post.reply_parent_id !== post.reply_root_id && (
        <div
          className="flex cursor-pointer items-center gap-2 px-4 transition hover:bg-gray-50"
          onClick={() => {
            router.push(
              `/profile/${user.username}/post/${post.reply_parent_id}`,
            );
          }}
        >
          <div className="w-10">
            <IconDotsVertical className="mx-auto my-1.5 text-border" />
          </div>
          <span className="text-primary">View full thread</span>
        </div>
      )}
      <article
        className={cn(
          "flex cursor-pointer gap-2 px-4 transition hover:bg-gray-50",
          !isRoot && !isParent && "border-gray-100 border-b",
        )}
        onClick={() => {
          router.push(`/profile/${user.username}/post/${post.id}`);
        }}
      >
        <div className="flex flex-col">
          <div className="mb-1 h-2">
            {(isChild || isParent) && (
              <div className="mx-auto h-full w-0.5 bg-border" />
            )}
          </div>
          <Avatar size="lg">
            <AvatarFallback>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="mt-1 flex-1">
            {(isParent || isRoot) && (
              <div className="mx-auto h-full w-0.5 bg-border" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 py-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-bold text-foreground hover:underline">
              {user.name}
            </span>
            <span>@{user.username}</span>
            {post.created_at ? (
              <>
                <span>·</span>
                <span>{formatPostTime(post.created_at)}</span>
              </>
            ) : null}
          </div>

          <p className="wrap-break-word whitespace-pre-wrap leading-normal">
            {post.content}
          </p>
          {post.media && post.media.length > 0 && (
            <div
              className={cn(
                "mt-2 grid w-fit grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl border border-gray-100",
                post.media.length > 1 && "aspect-video",
              )}
            >
              {post.media.map(
                (media, idx) =>
                  post.media && (
                    <div
                      key={media.url}
                      className={cn(
                        "h-full w-full",
                        post.media.length + idx <= 3 && "row-span-2",
                        post.media.length + idx === 1 && "col-span-2",
                      )}
                    >
                      <img
                        src={media.url}
                        alt="Post media"
                        className={cn(
                          post.media.length > 1
                            ? "h-full w-full object-cover"
                            : "max-h-100 max-w-full object-contain",
                        )}
                      />
                    </div>
                  ),
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1">
            <div className="flex-1">
              <Button
                className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setDialogOpen(true);
                }}
              >
                <span className="-m-2 rounded-full p-2 group-hover:bg-blue-500/10">
                  <IconMessage className="size-5" />
                </span>
                <span className="text-sm">{post.reply_count}</span>
              </Button>
            </div>
            <div className="flex-1">
              <Toggle
                className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-green-500"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="-m-2 rounded-full p-2 group-hover:bg-green-500/10">
                  <IconRepeat className="size-5" />
                </span>
                <span className="text-sm">{post.repost_count}</span>
              </Toggle>
            </div>
            <div className="flex-1">
              <Toggle
                className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-pink-600 data-pressed:text-pink-600"
                onPressedChange={handleLikeClick}
                onClick={(e) => e.stopPropagation()}
                pressed={!!userLiked}
              >
                <span className="-m-2 rounded-full p-2 group-hover:bg-pink-600/10">
                  <IconHeart className="size-5 group-data-pressed:fill-pink-600 group-data-pressed:stroke-pink-600" />
                </span>
                <span className="text-sm">{post.like_count}</span>
              </Toggle>
            </div>
            <Toggle className="group mr-2 flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-blue-500">
              <span className="-m-2 rounded-full p-2 group-hover:bg-blue-500/10">
                <IconBookmark className="size-5" />
              </span>
            </Toggle>
            <Button className="group flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-blue-500">
              <span className="-m-2 rounded-full p-2 group-hover:bg-blue-500/10">
                <IconShare2 className="size-5" />
              </span>
            </Button>
          </div>
        </div>
      </article>
      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentPost={post}
        parentUser={user}
      />
    </>
  );
}
