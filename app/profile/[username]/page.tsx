"use client";

import { Tabs } from "@base-ui/react/tabs";
import { IconArrowLeft, IconCalendar } from "@tabler/icons-react";
import { and, count, eq, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Activity, use } from "react";
import LikedPosts from "@/components/profile/liked-posts";
import { authClient } from "@/lib/auth-client";
import {
  electricFollowCollection,
  electricUserCollection,
} from "@/lib/collections";

const PostsFeed = dynamic(() => import("@/components/profile/posts-feed"), {
  ssr: false,
});
const RepliesFeed = dynamic(() => import("@/components/profile/replies-feed"), {
  ssr: false,
});
const MediaFeed = dynamic(() => import("@/components/profile/media-feed"), {
  ssr: false,
});

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  return <UserProfile username={username} />;
}

function UserProfile({ username }: { username: string }) {
  const { data: session } = authClient.useSession();
  const { data: user, isLoading: isUserLoading } = useLiveQuery(
    (q) =>
      q
        .from({ user: electricUserCollection })
        .where(({ user }) => eq(user.username, username))
        .findOne(),
    [username],
  );

  const { data: userFollowing } = useLiveQuery(
    (q) => {
      if (!session?.user?.id || !user?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) =>
          and(
            eq(follow.creator_id, session.user.id),
            eq(follow.subject_id, user.id),
          ),
        )
        .findOne();
    },
    [session?.user.id, user?.id],
  );

  const { data: following } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) => eq(follow.creator_id, user.id))
        .select(({ follow }) => ({ count: count(follow.subject_id) }))
        .findOne();
    },
    [user?.id],
  );

  const { data: followers } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) => eq(follow.subject_id, user.id))
        .select(({ follow }) => ({ count: count(follow.creator_id) }))
        .findOne();
    },
    [user?.id],
  );

  if (isUserLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        User "{username}" not found.
      </div>
    );
  }

  const handle = `@${username}`;
  const displayName = user.name || "Unknown User";

  return (
    <>
      <div className="sticky top-0 z-20 border-gray-100 border-b bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-full p-2 transition hover:bg-gray-100"
            aria-label="Back to home"
          >
            <IconArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="font-semibold text-lg leading-tight">{displayName}</p>
            <p className="text-muted-foreground text-sm">{0} posts</p>
          </div>
        </div>
      </div>
      <div className="aspect-3/1 w-full bg-linear-to-r from-indigo-500 via-blue-500 to-sky-400" />

      <div className="mb-4 px-4 pt-3">
        <div className="flex flex-wrap items-start justify-between">
          <div className="-mt-[15%] mb-3 aspect-square w-1/4 min-w-12 rounded-full border-4 border-white bg-linear-to-br from-white via-blue-100 to-blue-500" />
          <div className="flex">
            {session?.user?.id === user.id ? (
              <button
                type="button"
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-bold hover:bg-gray-100 focus-visible:bg-gray-100"
              >
                Edit profile
              </button>
            ) : userFollowing ? (
              <button
                type="button"
                onClick={() => {
                  if (!user || !session?.user) return;
                  electricFollowCollection.delete(
                    `${session.user.id}-${user.id}`,
                  );
                }}
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-bold hover:bg-gray-100 focus-visible:bg-gray-100"
              >
                Following
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!user || !session?.user) return;
                  electricFollowCollection.insert({
                    creator_id: session.user.id,
                    subject_id: user.id,
                    created_at: new Date(),
                  });
                }}
                className="rounded-full bg-primary px-4 py-1.5 font-bold text-white hover:bg-primary/90 focus-visible:bg-primary/90"
              >
                Follow
              </button>
            )}
          </div>
        </div>

        <div className="mt-1 space-y-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl">{displayName}</h1>
            </div>
            <p className="text-muted-foreground">{handle}</p>
          </div>
          <p>
            Design lead at Polaris Labs. Sharing product sketches, build notes,
            and photos from the coast.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-5" />
              Joined {dayjs(user.createdAt).format("MMMM YYYY")}
            </span>
          </div>

          <div className="flex gap-4">
            <span>
              <span className="font-semibold">{following?.count || 0}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span>
              <span className="font-semibold">{followers?.count || 0}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="posts">
        <Tabs.List className="flex border-gray-100 border-b">
          <Tabs.Tab
            value="posts"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Posts</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-blue-500 opacity-0 transition" />
          </Tabs.Tab>
          <Tabs.Tab
            value="replies"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Replies</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-blue-500 opacity-0 transition" />
          </Tabs.Tab>
          <Tabs.Tab
            value="media"
            className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
          >
            <span>Media</span>
            <span className="absolute -bottom-px h-1 w-14 rounded-full bg-blue-500 opacity-0 transition" />
          </Tabs.Tab>
          <Activity mode={session?.user?.id === user.id ? "visible" : "hidden"}>
            <Tabs.Tab
              value="likes"
              className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
            >
              <span>Likes</span>
              <span className="absolute -bottom-px h-1 w-14 rounded-full bg-blue-500 opacity-0 transition" />
            </Tabs.Tab>
          </Activity>
        </Tabs.List>

        <Tabs.Panel value="posts">
          <PostsFeed userId={user.id} />
        </Tabs.Panel>

        <Tabs.Panel value="replies">
          <RepliesFeed userId={user.id} />
        </Tabs.Panel>

        <Tabs.Panel value="media">
          <MediaFeed userId={user.id} />
        </Tabs.Panel>
        <Activity mode={session?.user?.id === user.id ? "visible" : "hidden"}>
          <Tabs.Panel value="likes">
            <LikedPosts userId={user.id} />
          </Tabs.Panel>
        </Activity>
      </Tabs.Root>
    </>
  );
}
