"use client";

import {
  IconHeart,
  IconMessage,
  IconRepeat,
  IconShare,
} from "@tabler/icons-react";
import type { MouseEvent } from "react";
import type * as z from "zod";

import type {
  selectLikeSchema,
  selectPostSchema,
  selectUserSchema,
} from "@/db/validation";
import { likePost, unlikePost } from "@/lib/actions";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import {
  electricLikeCollection,
  electricPostMediaCollection,
} from "@/lib/collections";
import { cn } from "@/lib/utils";

const PLACEHOLDER_NAME = "Demo User";
const PLACEHOLDER_HANDLE = "@demo_user";

function formatPostTime(value: Date | string | number | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(date);
}

type PostItemProps = {
  post: z.infer<typeof selectPostSchema>;
  user: z.infer<typeof selectUserSchema>;
  sessionUserId?: string;
  userLikes?: Array<z.infer<typeof selectLikeSchema>>;
};

export function PostItem({
  post,
  user,
  sessionUserId,
  userLikes,
}: PostItemProps) {
  const userLiked = !!userLikes?.some((like) => like.postId === post.id);
  const { data: postMedia } = useLiveQuery((q) =>
    q
      .from({ media: electricPostMediaCollection })
      .where(({ media }) => eq(media.postId, post.id))
      .orderBy(({ media }) => media.sortOrder, "asc")
  );

  const handleLikeClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!sessionUserId) return;

    if (userLiked) {
      unlikePost({
        userId: sessionUserId,
        postId: post.id,
      });
    } else {
      likePost({
        userId: sessionUserId,
        postId: post.id,
      });
    }
  };

  return (
    <article className="p-4 hover:bg-gray-100/50 cursor-pointer transition flex gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
        DU
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex gap-1 text-sm items-center">
          <span className="font-bold hover:underline text-foreground">
            {user.name ?? PLACEHOLDER_NAME}
          </span>
          <span>{PLACEHOLDER_HANDLE}</span>
          {post.createdAt ? (
            <>
              <span>·</span>
              <span>{formatPostTime(post.createdAt)}</span>
            </>
          ) : null}
        </div>

        <p className="mt-1 leading-normal whitespace-pre-wrap wrap-break-word">
          {post.content}
        </p>
        {postMedia && postMedia.length > 0 && (
          <div
            className={cn(
              "grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden max-h-120 mt-2 rounded-2xl border border-gray-100",
              postMedia.length > 1 && "aspect-video"
            )}
          >
            {postMedia.map((media, idx) => (
              <div
                key={media.id}
                className={cn(
                  "w-full h-full",
                  postMedia.length + idx <= 3 && "row-span-2",
                  postMedia.length + idx === 1 && "col-span-2"
                )}
              >
                <img
                  src={media.mediaUrl}
                  alt="Post media"
                  className={cn("w-full h-full object-cover")}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-3 max-w-md">
          <div className="hover:text-blue-500 flex gap-2 items-center group">
            <div className="p-2 rounded-full group-hover:bg-blue-500/10">
              <IconMessage className="size-4" />
            </div>
            {post.replyCount}
          </div>
          <div className="hover:text-green-500 flex gap-2 items-center group">
            <div className="p-2 rounded-full group-hover:bg-green-500/10">
              <IconRepeat className="size-4" />
            </div>
            {post.repostCount}
          </div>
          <div
            className="hover:text-pink-600 flex gap-2 items-center group"
            onClick={handleLikeClick}
          >
            <div className="p-2 rounded-full group-hover:bg-pink-600/10">
              <IconHeart className="size-4" />
            </div>
            {post.likeCount} {userLiked ? <span>❤️</span> : null}
          </div>
          <div className="hover:text-blue-500 flex gap-2 items-center group">
            <div className="p-2 rounded-full group-hover:bg-blue-500/10">
              <IconShare className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
