import { Tabs } from "@base-ui/react/tabs";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import { and, eq, useLiveQuery } from "@tanstack/react-db";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import dayjs from "dayjs";
import { Activity, useState } from "react";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import LikedPosts from "@/components/profile/liked-posts";
import MediaFeed from "@/components/profile/media-feed";
import PostsFeed from "@/components/profile/posts-feed";
import RepliesFeed from "@/components/profile/replies-feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mutateFollow } from "@/lib/actions";
import {
  electricBookmarkCollection,
  electricFollowCollection,
  electricLikeCollection,
  electricRepostCollection,
  electricUserCollection,
} from "@/lib/collections";

export const Route = createFileRoute("/profile/$username/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    if (context.user) {
      await Promise.all([
        electricLikeCollection.preload(),
        electricRepostCollection.preload(),
        electricBookmarkCollection.preload(),
      ]);
    }
    return context;
  },
});

function RouteComponent() {
  const { username } = Route.useParams();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user: sessionUser } = Route.useLoaderData();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { data: profileUser, isLoading: isProfileUserLoading } = useLiveQuery(
    (q) =>
      q
        .from({ user: electricUserCollection })
        .where(({ user }) => eq(user.username, username))
        .findOne(),
    [username],
  );

  const { data: userFollowing } = useLiveQuery(
    (q) => {
      if (!sessionUser?.id || !profileUser?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) =>
          and(
            eq(follow.creator_id, sessionUser.id),
            eq(follow.subject_id, profileUser.id),
          ),
        )
        .findOne();
    },
    [sessionUser?.id, profileUser?.id],
  );

  if (isProfileUserLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!profileUser) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        User "{username}" not found.
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex h-14 items-center border-b bg-white/85 px-4 backdrop-blur-md">
        <div className="flex min-w-14 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="-m-2 rounded-full p-2"
            aria-label="Back"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                router.navigate({ to: "/", replace: true });
              }
            }}
          >
            <IconArrowLeft className="size-5" />
          </Button>
        </div>
        <div>
          <p className="font-semibold text-lg leading-tight">
            {profileUser.name}
          </p>
          <p className="text-muted-foreground text-sm leading-tight">
            {profileUser.postsCount || 0} posts
          </p>
        </div>
      </div>

      <div className="aspect-3/1 w-full bg-muted" />

      <div className="mb-4 px-4 pt-3">
        <div className="flex flex-wrap items-start justify-between">
          <div className="-mt-[15%] mb-3 aspect-square w-1/4 min-w-12 rounded-full border-4 border-white">
            <Avatar className="size-full">
              <AvatarImage
                src={profileUser.image || undefined}
                alt={profileUser.name}
              />
              <AvatarFallback className="text-5xl">
                {profileUser.name ? profileUser.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex">
            {sessionUser ? (
              sessionUser?.id === profileUser.id ? (
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(true)}
                  className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-bold hover:bg-gray-100 focus-visible:bg-gray-100"
                >
                  Edit profile
                </button>
              ) : userFollowing ? (
                <button
                  type="button"
                  onClick={() => {
                    mutateFollow({
                      userId: sessionUser.id,
                      payload: { subject_id: profileUser.id },
                      type: "user.unfollow",
                    });
                  }}
                  className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-bold hover:bg-gray-100 focus-visible:bg-gray-100"
                >
                  Following
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    mutateFollow({
                      userId: sessionUser.id,
                      payload: { subject_id: profileUser.id },
                      type: "user.follow",
                    });
                  }}
                  className="rounded-full bg-primary px-4 py-1.5 font-bold text-white hover:bg-primary/90 focus-visible:bg-primary/90"
                >
                  Follow
                </button>
              )
            ) : null}
          </div>
        </div>

        <div className="mt-1 space-y-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl">{profileUser.name}</h1>
            </div>
            <p className="text-muted-foreground">@{profileUser.username}</p>
          </div>
          <p>{profileUser.bio}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-5" />
              Joined {dayjs(profileUser.createdAt).format("MMMM YYYY")}
            </span>
          </div>

          <div className="flex gap-4">
            <span>
              <span className="font-semibold">
                {profileUser.followsCount || 0}
              </span>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span>
              <span className="font-semibold">
                {profileUser.followersCount || 0}
              </span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="posts">
        <Tabs.List className="flex border-b">
          <Tabs.Tab
            value="posts"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Posts</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
          </Tabs.Tab>
          <Tabs.Tab
            value="replies"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Replies</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
          </Tabs.Tab>
          <Tabs.Tab
            value="media"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Media</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
          </Tabs.Tab>
          <Activity
            mode={sessionUser?.id === profileUser.id ? "visible" : "hidden"}
          >
            <Tabs.Tab
              value="likes"
              className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
            >
              <span>Likes</span>
              <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
            </Tabs.Tab>
          </Activity>
        </Tabs.List>

        <Tabs.Panel value="posts">
          <PostsFeed userId={profileUser.id} />
        </Tabs.Panel>

        <Tabs.Panel value="replies">
          <RepliesFeed userId={profileUser.id} />
        </Tabs.Panel>

        <Tabs.Panel value="media">
          <MediaFeed userId={profileUser.id} />
        </Tabs.Panel>
        <Activity
          mode={sessionUser?.id === profileUser.id ? "visible" : "hidden"}
        >
          <Tabs.Panel value="likes">
            <LikedPosts userId={profileUser.id} />
          </Tabs.Panel>
        </Activity>
      </Tabs.Root>
      <Activity
        mode={sessionUser?.id === profileUser.id ? "visible" : "hidden"}
      >
        <EditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
        />
      </Activity>
    </>
  );
}
