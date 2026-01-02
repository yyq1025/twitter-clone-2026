"use client";

import { Tabs } from "@base-ui/react/tabs";
import {
  IconArrowLeft,
  IconCalendar,
  IconChartBar,
  IconDots,
  IconHeart,
  IconMessageCircle2,
  IconRepeat,
} from "@tabler/icons-react";
import {
  and,
  count,
  createLiveQueryCollection,
  eq,
  useLiveInfiniteQuery,
  useLiveQuery,
} from "@tanstack/react-db";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { type ReactNode, use } from "react";
import { PostItem } from "@/components/post-item";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import { authClient } from "@/lib/auth-client";
import {
  electricFollowCollection,
  electricLikeCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";

const MediaPosts = dynamic(() => import("@/components/profile/media-posts"), {
  ssr: false,
});

type ProfilePost = {
  id: number;
  author: string;
  handle: string;
  time: string;
  text: string;
  replyTo?: string;
  media?: string;
  badge?: string;
  stats?: {
    comments: string;
    reposts: string;
    likes: string;
    views: string;
  };
};

type MediaItem = {
  id: number;
  url: string;
  alt: string;
};

const DEFAULT_STATS = {
  comments: "42",
  reposts: "81",
  likes: "541",
  views: "62.4K",
};

const pageSize = 20;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ tab?: string[]; username: string }>;
}) {
  const { tab, username } = use(params);

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

  const postsWithUser = createLiveQueryCollection((q) =>
    q
      .from({
        post: electricPostCollection,
      })
      .leftJoin({ user: electricUserCollection }, ({ post, user }) =>
        eq(user.id, post.creator_id),
      ),
  );

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({ postWithUser: postsWithUser })
        .where(({ postWithUser: { post } }) =>
          eq(post.creator_id, user?.id ?? -1),
        )
        .orderBy(({ postWithUser: { post } }) => post.created_at, "desc"),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [user?.id],
  );

  const {
    data: userLikedPosts,
    isError: isUserLikedPostsError,
    isLoading: isUserLikedPostsLoading,
    hasNextPage: hasNextPageUserLikedPosts,
    fetchNextPage: fetchNextPageUserLikedPosts,
    isFetchingNextPage: isFetchingNextPageUserLikedPosts,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({ like: electricLikeCollection })
        .innerJoin(
          { postWithUser: postsWithUser },
          ({ like, postWithUser: { post } }) => eq(like.post_id, post.id),
        )
        .where(({ like }) => eq(like.user_id, user?.id ?? -1))
        .orderBy(({ like }) => like.created_at, "desc")
        .select(({ postWithUser: { post, user } }) => ({ post, user })),
    {
      pageSize: pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [user?.id],
  );

  if (!user && !isUserLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        User "{username}" not found.
      </div>
    );
  }

  const handle = `@${username}`;
  const displayName = user?.name || "Unknown User";

  const replies: ProfilePost[] = [
    {
      id: 4,
      author: displayName,
      handle,
      time: "12h",
      text: "Appreciate the feature request! We're exploring calmer notification states so things don't feel noisy.",
      replyTo: "@designweekly",
      stats: {
        comments: "18",
        reposts: "36",
        likes: "421",
        views: "21.7K",
      },
    },
    {
      id: 5,
      author: displayName,
      handle,
      time: "2d",
      text: "Yes! The timeline will keep context while you browse profiles. Will share a prototype soon.",
      replyTo: "@shippingdaily",
      stats: {
        comments: "9",
        reposts: "25",
        likes: "288",
        views: "14.1K",
      },
    },
  ];

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
            {session?.user?.username === username ? (
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
              <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 text-xs">
                New
              </span>
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
              Joined {dayjs(user?.createdAt).format("MMMM YYYY")}
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
          {[
            { name: "Posts", value: "posts" },
            { name: "Replies", value: "with_replies" },
            { name: "Media", value: "media" },
            { name: "Likes", value: "likes" },
          ].map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
            >
              <span>{tab.name}</span>
              <span className="absolute -bottom-px h-1 w-14 rounded-full bg-blue-500 opacity-0 transition" />
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="posts">
          <VirtualInfiniteList
            data={data}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            isLoading={isLoading}
            getKey={(item) => item.post.id}
            renderItem={(item) => (
              <PostItem post={item.post} user={item.user} />
            )}
          />
        </Tabs.Panel>

        <Tabs.Panel value="with_replies">
          {replies.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="media">
          <MediaPosts username={username} />
        </Tabs.Panel>
        <Tabs.Panel value="likes">
          <VirtualInfiniteList
            data={userLikedPosts}
            hasNextPage={hasNextPageUserLikedPosts}
            fetchNextPage={fetchNextPageUserLikedPosts}
            isFetchingNextPage={isFetchingNextPageUserLikedPosts}
            isError={isUserLikedPostsError}
            isLoading={isUserLikedPostsLoading}
            getKey={(item) => item.post.id}
            renderItem={(item) => (
              <PostItem post={item.post} user={item.user} />
            )}
          />
        </Tabs.Panel>
      </Tabs.Root>
    </>
  );
}

function PostCard({ post }: { post: ProfilePost }) {
  const stats = post.stats ?? DEFAULT_STATS;

  return (
    <article className="flex gap-3 px-4 py-5 transition hover:bg-gray-50/70">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-indigo-600 font-semibold text-sm text-white">
        {post.author.slice(0, 1)}
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/70"
          aria-hidden
        ></span>
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{post.author}</span>
              <span className="text-muted-foreground">
                {post.handle} · {post.time}
              </span>
            </div>
            {post.badge ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-[11px] text-blue-700">
                {post.badge}
              </span>
            ) : null}
            {post.replyTo ? (
              <p className="text-muted-foreground text-sm">
                Replying to{" "}
                <span className="text-blue-600">{post.replyTo}</span>
              </p>
            ) : null}
          </div>
          <button className="rounded-full p-1.5 transition hover:bg-gray-100">
            <IconDots className="size-4" />
          </button>
        </div>

        <p className="text-gray-900 text-sm leading-6">{post.text}</p>

        {post.media ? (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <img src={post.media} alt="" className="h-56 w-full object-cover" />
          </div>
        ) : null}

        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <Interaction
            icon={<IconMessageCircle2 className="size-4" />}
            label={stats.comments}
          />
          <Interaction
            icon={<IconRepeat className="size-4" />}
            label={stats.reposts}
          />
          <Interaction
            icon={<IconHeart className="size-4" />}
            label={stats.likes}
          />
          <Interaction
            icon={<IconChartBar className="size-4" />}
            label={stats.views}
          />
        </div>
      </div>
    </article>
  );
}

function Interaction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-gray-100 hover:text-black">
      {icon}
      {label}
    </span>
  );
}
