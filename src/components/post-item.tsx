import { Button } from "@base-ui/react/button";
import {
  IconBookmark,
  IconDotsVertical,
  IconHeart,
  IconMessage,
  IconRepeat,
  IconShare2,
} from "@tabler/icons-react";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { Activity, type ReactNode, useState } from "react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import ProfileHoverCard from "@/components/profile/profile-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { mutateBookmark, mutateLike, mutateRepost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import {
  electricBookmarkCollection,
  electricLikeCollection,
  electricRepostCollection,
} from "@/lib/collections";
import { cn } from "@/lib/utils";
import type { SelectPost, SelectUser } from "@/lib/validators";

interface PostItemProps {
  post: SelectPost;
  user: SelectUser;
  feedReason?: ReactNode;
  isRoot?: boolean;
  isParent?: boolean;
  isChild?: boolean;
}

export function PostItem({
  post,
  user,
  feedReason,
  isRoot = false,
  isParent = false,
  isChild = false,
}: PostItemProps) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: userLiked } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) return null;
      return q
        .from({ like: electricLikeCollection })
        .where(({ like }) =>
          and(
            eq(like.subject_id, post.id),
            eq(like.creator_id, session.user.id),
          ),
        )
        .findOne();
    },
    [session?.user?.id, post.id],
  );

  const { data: userReposted } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) return null;
      return q
        .from({ repost: electricRepostCollection })
        .where(({ repost }) =>
          and(
            eq(repost.subject_id, post.id),
            eq(repost.creator_id, session.user.id),
          ),
        )
        .findOne();
    },
    [session?.user?.id, post.id],
  );

  const { data: userBookmarked } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) return null;
      return q
        .from({ bookmark: electricBookmarkCollection })
        .where(({ bookmark }) =>
          and(
            eq(bookmark.subject_id, post.id),
            eq(bookmark.creator_id, session.user.id),
          ),
        )
        .findOne();
    },
    [session?.user?.id, post.id],
  );

  const handleLikeMutate = () => {
    if (!session?.user?.id) return;
    mutateLike({
      type: userLiked ? "post.unlike" : "post.like",
      payload: { subject_id: post.id },
      userId: session.user.id,
    });
  };

  const handleRepostMutate = () => {
    if (!session?.user?.id) return;
    mutateRepost({
      type: userReposted ? "post.unrepost" : "post.repost",
      payload: { subject_id: post.id },
      userId: session.user.id,
    });
  };

  const handleBookmarkMutate = () => {
    if (!session?.user?.id) return;
    mutateBookmark({
      type: userBookmarked ? "post.unbookmark" : "post.bookmark",
      payload: { subject_id: post.id },
      userId: session.user.id,
    });
  };

  return (
    <>
      <article
        className={cn(
          "cursor-pointer px-4 transition hover:bg-gray-50",
          !isRoot && !isParent && "border-b",
        )}
        onClick={() => {
          navigate({
            to: "/profile/$username/post/$postId",
            params: { username: user.username!, postId: post.id },
          });
        }}
      >
        {feedReason ? (
          feedReason
        ) : (
          <div className="mb-1 h-2 w-10">
            {(isChild || isParent) && (
              <div className="mx-auto h-full w-0.5 bg-border" />
            )}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex flex-col">
            <ProfileHoverCard
              trigger={
                <Avatar size="lg">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback>
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              }
              user={user}
            />
            <div className="mt-1 flex-1">
              {(isParent || isRoot) && (
                <div className="mx-auto h-full w-0.5 bg-border" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 pb-1 text-muted-foreground leading-tight">
              <ProfileHoverCard
                trigger={
                  <span className="font-semibold text-foreground hover:underline">
                    {user.name}
                  </span>
                }
                user={user}
              />
              <ProfileHoverCard
                trigger={<span>@{user.username}</span>}
                user={user}
              />
              <span>·</span>
              <span>{dayjs(post.created_at).format("MMM D")}</span>
            </p>

            <p className="wrap-break-word whitespace-pre-wrap leading-tight">
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
                        key={media.key}
                        className={cn(
                          "h-full w-full",
                          post.media.length + idx <= 3 && "row-span-2",
                          post.media.length + idx === 1 && "col-span-2",
                        )}
                      >
                        <img
                          src={`${import.meta.env.VITE_AWS_ENDPOINT}/${media.key}`}
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

            <div className="flex items-center gap-1 py-1">
              <div className="flex-1">
                <Button
                  className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!session?.user) return;
                    setDialogOpen(true);
                  }}
                >
                  <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
                    <IconMessage className="size-5" />
                  </span>
                  <span className="text-sm">{post.reply_count}</span>
                </Button>
              </div>
              <div className="flex-1">
                <Toggle
                  className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:bg-transparent hover:text-green-600 aria-pressed:bg-transparent aria-pressed:text-green-600"
                  onClick={(e) => e.stopPropagation()}
                  onPressedChange={handleRepostMutate}
                  pressed={!!userReposted}
                >
                  <span className="-m-2 rounded-full p-2 group-hover:bg-green-600/10">
                    <IconRepeat className="size-5 group-aria-pressed:stroke-green-600" />
                  </span>
                  <span className="text-sm">{post.repost_count}</span>
                </Toggle>
              </div>
              <div className="flex-1">
                <Toggle
                  className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:bg-transparent hover:text-pink-600 aria-pressed:bg-transparent aria-pressed:text-pink-600"
                  onPressedChange={handleLikeMutate}
                  onClick={(e) => e.stopPropagation()}
                  pressed={!!userLiked}
                >
                  <span className="-m-2 rounded-full p-2 group-hover:bg-pink-600/10">
                    <IconHeart className="size-5 group-aria-pressed:fill-pink-600 group-aria-pressed:stroke-pink-600" />
                  </span>
                  <span className="text-sm">{post.like_count}</span>
                </Toggle>
              </div>
              <Toggle
                className="group mr-2 flex cursor-pointer items-center gap-2 text-muted-foreground hover:bg-transparent hover:text-blue-600 aria-pressed:bg-transparent"
                onClick={(e) => e.stopPropagation()}
                onPressedChange={handleBookmarkMutate}
                pressed={!!userBookmarked}
              >
                <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
                  <IconBookmark className="size-5 group-aria-pressed:fill-blue-600 group-aria-pressed:stroke-blue-600" />
                </span>
              </Toggle>
              <Button
                className="group flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-blue-600"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
                  <IconShare2 className="size-5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </article>
      <Activity mode={session?.user ? "visible" : "hidden"}>
        <CreatePostDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          parentPost={post}
          parentUser={user}
        />
      </Activity>
    </>
  );
}
