import { Button } from "@base-ui/react/button";
import {
  IconBookmark,
  IconHeart,
  IconMessage,
  IconRepeat,
  IconShare2,
} from "@tabler/icons-react";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import { useState } from "react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import ProfileHoverCard from "@/components/profile/profile-hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import { mutateLike, mutateRepost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import {
  electricLikeCollection,
  electricRepostCollection,
} from "@/lib/collections";
import { cn } from "@/lib/utils";
import type { SelectPost, SelectUser } from "@/lib/validators";

interface ThreadAnchorProps {
  post: SelectPost;
  user: SelectUser;
}

export function ThreadAnchor({ post, user }: ThreadAnchorProps) {
  const { data: session } = authClient.useSession();
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

  return (
    <>
      <div className="border-b px-4">
        <div className="mb-1 h-2 w-10">
          {post.reply_parent_id && (
            <div className="mx-auto h-full w-0.5 bg-border" />
          )}
        </div>
        <div className="flex items-center gap-2 pb-3">
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
          <div className="flex-1">
            <ProfileHoverCard
              trigger={
                <p className="font-semibold leading-tight hover:underline">
                  {user.name}
                </p>
              }
              user={user}
            />
            <ProfileHoverCard
              trigger={
                <p className="text-muted-foreground leading-tight">
                  @{user.username}
                </p>
              }
              user={user}
            />
          </div>
        </div>
        <p className="wrap-break-word whitespace-pre-wrap text-lg leading-tight">
          {post.content}
        </p>
        {post.media && post.media.length > 0 && (
          <div
            className={cn(
              "mt-3 grid w-fit grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-xl border border-gray-100",
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
        <p className="my-3 text-muted-foreground text-sm">
          {dayjs(post.created_at).format("h:mm A · MMM D, YYYY")}
        </p>
        <div className="flex items-center gap-1 border-t py-2">
          <div className="flex-1">
            <Button
              className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
                <IconMessage className="size-6" />
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
                <IconRepeat className="size-6 group-aria-pressed:stroke-green-600" />
              </span>
              <span className="text-sm">{post.repost_count}</span>
            </Toggle>
          </div>
          <div className="flex-1">
            <Toggle
              className="group flex cursor-pointer items-center gap-1 text-muted-foreground hover:bg-transparent hover:text-pink-600 aria-pressed:bg-transparent aria-pressed:text-pink-600"
              onClick={(e) => e.stopPropagation()}
              onPressedChange={handleLikeMutate}
              pressed={!!userLiked}
            >
              <span className="-m-2 rounded-full p-2 group-hover:bg-pink-600/10">
                <IconHeart className="size-6 group-aria-pressed:fill-pink-600 group-aria-pressed:stroke-pink-600" />
              </span>
              <span className="text-sm">{post.like_count}</span>
            </Toggle>
          </div>
          <div className="flex-1">
            <Toggle className="group mr-2 flex cursor-pointer items-center gap-2 text-muted-foreground hover:bg-transparent hover:text-blue-600 aria-pressed:bg-transparent">
              <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
                <IconBookmark className="size-6" />
              </span>
            </Toggle>
          </div>
          <Button className="group flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-blue-600">
            <span className="-m-2 rounded-full p-2 group-hover:bg-blue-600/10">
              <IconShare2 className="size-6" />
            </span>
          </Button>
        </div>
      </div>
      <div className="border-b">
        <Button
          className="flex size-full items-center gap-2 px-4 py-3 hover:bg-muted"
          onClick={() => setDialogOpen(true)}
        >
          <Avatar size="sm">
            <AvatarImage
              src={session?.user?.image || undefined}
              alt={session?.user?.name || "User"}
            />
            <AvatarFallback>
              {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">Write your reply</span>
        </Button>
      </div>
      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentPost={post}
        parentUser={user}
      />
    </>
  );
}
