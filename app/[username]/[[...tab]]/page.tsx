"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
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
  electricFollowCollection,
  electricLikeCollection,
  electricPostCollection,
  electricPostMediaCollection,
  electricUserCollection,
} from "@/lib/collections";
import {
  and,
  count,
  createLiveQueryCollection,
  eq,
  useLiveQuery,
} from "@tanstack/react-db";
import dayjs from "dayjs";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { PostItem } from "@/components/post-item";

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

export default function ProfilePage({
  params,
}: {
  params: Promise<{ tab?: string[]; username: string }>;
}) {
  const { tab, username } = use(params);
  const [collectionsLoaded, setCollectionsLoaded] = useState(
    [
      electricPostCollection,
      electricPostMediaCollection,
      electricUserCollection,
      electricLikeCollection,
      electricFollowCollection,
    ].every((col) => col.isReady())
  );

  useEffect(() => {
    if (collectionsLoaded) return;
    Promise.all(
      [
        electricPostCollection,
        electricPostMediaCollection,
        electricUserCollection,
        electricLikeCollection,
        electricFollowCollection,
      ].map((col) => col.preload())
    ).then(() => setCollectionsLoaded(true));
  }, [collectionsLoaded]);

  if (!collectionsLoaded) {
    return null;
  }

  return <UserProfile username={username} tab={tab} />;
}

function UserProfile({ username, tab }: { username: string; tab?: string[] }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: user, isLoading: isUserLoading } = useLiveQuery(
    (q) =>
      q
        .from({ user: electricUserCollection })
        .where(({ user }) => eq(user.username, username))
        .findOne(),
    [username]
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
            eq(follow.followerId, session.user.id),
            eq(follow.followingId, user.id)
          )
        )
        .findOne();
    },
    [session?.user.id, user?.id]
  );

  const { data: following } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) => eq(follow.followerId, user.id))
        .select(({ follow }) => ({ count: count(follow.followingId) }))
        .findOne();
    },
    [user?.id]
  );

  const { data: followers } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ follow: electricFollowCollection })
        .where(({ follow }) => eq(follow.followingId, user.id))
        .select(({ follow }) => ({ count: count(follow.followerId) }))
        .findOne();
    },
    [user?.id]
  );

  const postsWithUser = createLiveQueryCollection((q) =>
    q
      .from({
        post: electricPostCollection,
      })
      .leftJoin({ user: electricUserCollection }, ({ post, user }) =>
        eq(user.id, post.userId)
      )
  );

  const { data: posts } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ postWithUser: postsWithUser })
        .where(({ postWithUser: { post } }) => eq(post.userId, user?.id ?? -1))
        .orderBy(({ postWithUser: { post } }) => post.createdAt, "desc");
    },
    [user?.id]
  );

  const { data: userLikedPosts } = useLiveQuery(
    (q) => {
      if (!user?.id) {
        return null;
      }
      return q
        .from({ like: electricLikeCollection })
        .innerJoin(
          { postWithUser: postsWithUser },
          ({ like, postWithUser: { post } }) => eq(like.postId, post.id)
        )
        .where(({ like }) => eq(like.userId, user.id))
        .orderBy(({ like }) => like.createdAt, "desc")
        .select(({ postWithUser: { post, user } }) => ({ post, user }));
    },
    [user?.id]
  );

  if (!user && !isUserLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
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

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
      alt: "Abstract gradients",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1000&q=80",
      alt: "Desk setup",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1000&q=80",
      alt: "Beach sunrise",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
      alt: "City lights",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
      alt: "Notebook sketching",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1000&q=80",
      alt: "Soft gradient poster",
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="rounded-full p-2 transition hover:bg-gray-100"
            aria-label="Back to home"
          >
            <IconArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="text-lg font-semibold leading-tight">{displayName}</p>
            <p className="text-sm text-gray-500">{posts.length} posts</p>
          </div>
        </div>
      </div>
      <div className="aspect-3/1 w-full bg-linear-to-r from-indigo-500 via-blue-500 to-sky-400" />

      <div className="px-4 pt-3 mb-4">
        <div className="flex flex-wrap items-start justify-between">
          <div className="aspect-square w-1/4 min-w-12 -mt-[15%] mb-3 rounded-full border-4 border-white bg-linear-to-br from-white via-blue-100 to-blue-500" />
          <div className="flex">
            {session?.user?.username === username ? (
              <button
                type="button"
                className="rounded-full px-4 py-1.5 font-bold bg-white border border-gray-300 hover:bg-gray-100 focus-visible:bg-gray-100"
              >
                Edit profile
              </button>
            ) : userFollowing ? (
              <button
                type="button"
                onClick={() => {
                  if (!user || !session?.user) return;
                  electricFollowCollection.delete(
                    `${session.user.id}-${user.id}`
                  );
                }}
                className="rounded-full px-4 py-1.5 font-bold bg-white border border-gray-300 hover:bg-gray-100 focus-visible:bg-gray-100"
              >
                Following
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!user || !session?.user) return;
                  electricFollowCollection.insert({
                    followerId: session.user.id,
                    followingId: user.id,
                    createdAt: new Date(),
                  });
                }}
                className="rounded-full px-4 py-1.5 font-bold bg-primary text-white hover:bg-primary/90 focus-visible:bg-primary/90"
              >
                Follow
              </button>
            )}
          </div>
        </div>

        <div className="mt-1 space-y-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{displayName}</h1>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                New
              </span>
            </div>
            <p className="text-sm text-gray-500">{handle}</p>
          </div>
          <p className="text-sm text-gray-800">
            Design lead at Polaris Labs. Sharing product sketches, build notes,
            and photos from the coast.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-4" />
              Joined {dayjs(user?.createdAt).format("MMMM YYYY")}
            </span>
          </div>

          <div className="flex gap-4 text-sm">
            <span>
              <span className="font-semibold">{following?.count || 0}</span>{" "}
              <span className="text-gray-500">Following</span>
            </span>
            <span>
              <span className="font-semibold">{followers?.count || 0}</span>{" "}
              <span className="text-gray-500">Followers</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs.Root
        value={tab?.[0] || "posts"}
        onValueChange={(value) => {
          if (value === "posts") {
            router.push(`/${username}`);
          } else {
            router.push(`/${username}/${value}`);
          }
        }}
      >
        <Tabs.List className="grid grid-cols-4 border-b border-gray-100">
          {[
            { name: "Posts", value: "posts" },
            { name: "Replies", value: "with_replies" },
            { name: "Media", value: "media" },
            { name: "Likes", value: "likes" },
          ].map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              className="relative flex justify-center py-4 text-center font-semibold outline-none transition text-gray-500 hover:bg-gray-50 data-[state=active]:text-black data-[state=active]:*:opacity-100"
            >
              <span>{tab.name}</span>
              <span className="absolute w-14 -bottom-px h-1 rounded-full bg-blue-500 transition opacity-0" />
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="posts">
          {!posts || posts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No posts yet.</div>
          ) : (
            posts.map(({ post, user }) => (
              <PostItem
                key={post.id}
                post={post}
                user={user}
                sessionUserId={session?.user?.id}
              />
            ))
          )}
        </Tabs.Content>

        <Tabs.Content value="with_replies">
          {replies.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Tabs.Content>

        <Tabs.Content value="media">
          <MediaGrid items={mediaItems} />
        </Tabs.Content>
        <Tabs.Content value="likes">
          {!userLikedPosts || userLikedPosts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No liked posts yet.
            </div>
          ) : (
            userLikedPosts.map(({ post, user }) => (
              <PostItem
                key={post.id}
                post={post}
                user={user}
                sessionUserId={session?.user?.id}
              />
            ))
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

function PostCard({ post }: { post: ProfilePost }) {
  const stats = post.stats ?? DEFAULT_STATS;

  return (
    <article className="flex gap-3 px-4 py-5 transition hover:bg-gray-50/70">
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-indigo-600 text-sm font-semibold text-white">
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
              <span className="text-gray-500">
                {post.handle} · {post.time}
              </span>
            </div>
            {post.badge ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                {post.badge}
              </span>
            ) : null}
            {post.replyTo ? (
              <p className="text-sm text-gray-500">
                Replying to{" "}
                <span className="text-blue-600">{post.replyTo}</span>
              </p>
            ) : null}
          </div>
          <button className="rounded-full p-1.5 transition hover:bg-gray-100">
            <IconDots className="size-4" />
          </button>
        </div>

        <p className="text-sm leading-6 text-gray-900">{post.text}</p>

        {post.media ? (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <img src={post.media} alt="" className="h-56 w-full object-cover" />
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs text-gray-500">
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

function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative overflow-hidden border border-gray-100 bg-gray-50 aspect-square"
        >
          <img
            src={item.url}
            alt={item.alt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-black/0 opacity-0 transition group-hover:opacity-100"></div>
        </div>
      ))}
    </div>
  );
}
