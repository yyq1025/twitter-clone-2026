import { IconHeartFilled, IconRepeat, IconUserPlus } from "@tabler/icons-react";
import { eq, useLiveInfiniteQuery, useLiveQuery } from "@tanstack/react-db";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { PostItem } from "@/components/post-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VirtualInfiniteList from "@/components/virtual-infinite-list";
import { authClient } from "@/lib/auth-client";
import {
  electricNotificationCollection,
  electricPostCollection,
  electricUserCollection,
} from "@/lib/collections";
import type {
  SelectNotification,
  SelectPost,
  SelectUser,
} from "@/lib/validators";

interface NotificationItemProps {
  notification: SelectNotification;
  user: SelectUser;
  reason_post?: SelectPost;
  post?: SelectPost;
  additionalUsers: SelectUser[];
}

function NotificationItem({
  notification,
  user,
  reason_post,
  post,
  additionalUsers,
}: NotificationItemProps) {
  if (notification.reason === "reply" && post) {
    return <PostItem post={post} user={user} />;
  }

  const icon =
    notification.reason === "like" ? (
      <IconHeartFilled className="size-7 text-pink-600" />
    ) : notification.reason === "repost" ? (
      <IconRepeat className="size-7 text-green-600" />
    ) : notification.reason === "follow" ? (
      <IconUserPlus className="size-7 text-blue-600" />
    ) : null;

  return (
    <div className="flex items-start border-b py-2.5 pr-4 pl-2.5">
      <div className="flex w-15 items-start justify-end pt-0.5 pr-2">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Avatar className="size-9">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          {additionalUsers.slice(0, 4).map((u) => (
            <Avatar key={u.id} className="size-9">
              <AvatarImage src={u.image || undefined} alt={u.name} />
              <AvatarFallback>
                {u.name ? u.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          ))}
          {additionalUsers.length > 4 && (
            <span className="pl-1 font-semibold text-[#667B99] text-sm">
              +{additionalUsers.length - 4}
            </span>
          )}
        </div>
        <div className="pt-1.5">
          <span>
            <span className="font-semibold hover:underline">{user.name}</span>
            {additionalUsers.length > 0 && (
              <>
                {" "}
                and{" "}
                <span className="font-semibold">
                  {additionalUsers.length} other
                  {additionalUsers.length > 1 && "s"}
                </span>
              </>
            )}{" "}
            {notification.reason === "like"
              ? "liked your post"
              : notification.reason === "repost"
                ? "reposted your post"
                : notification.reason === "follow"
                  ? "followed you"
                  : null}
            <span className="text-muted-foreground"> · </span>
            <span className="text-muted-foreground">
              {dayjs(notification.created_at).format("MMM D")}
            </span>
          </span>
        </div>
        {reason_post && (
          <p className="pt-0.5 text-muted-foreground text-sm">
            {reason_post.content}
          </p>
        )}
      </div>
    </div>
  );
}

const pageSize = 50;

export default function NotificationList({ userId }: { userId: string }) {
  const [updating, setUpdating] = useState(false);

  const { data: user } = useLiveQuery(
    (q) =>
      q
        .from({ user: electricUserCollection })
        .where(({ user }) => eq(user.id, userId))
        .findOne(),
    [userId],
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
        .from({ notification: electricNotificationCollection })
        .where(({ notification }) => eq(notification.recipient_id, userId))
        .innerJoin({ user: electricUserCollection }, ({ notification, user }) =>
          eq(notification.creator_id, user.id),
        )
        .leftJoin(
          { reason_post: electricPostCollection },
          ({ notification, reason_post }) =>
            eq(notification.reason_subject_id, reason_post.id),
        )
        .leftJoin({ post: electricPostCollection }, ({ notification, post }) =>
          eq(notification.post_id, post.id),
        )
        .orderBy(({ notification }) => notification.id, "desc"),
    {
      pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [userId],
  );

  useEffect(() => {
    if (
      data[0]?.notification.id &&
      user &&
      !updating &&
      data[0].notification.id > (user?.lastSeenNotificationId || 0)
    ) {
      setUpdating(true);
      authClient
        .updateUser({
          lastSeenNotificationId: data[0].notification.id,
        })
        .finally(() => {
          setUpdating(false);
        });
    }
  }, [data[0]?.notification.id, user, updating]);

  const groupedNotifications: {
    notification: SelectNotification;
    user: SelectUser;
    reason_post?: SelectPost;
    post?: SelectPost;
    additionalUsers: SelectUser[];
  }[] = [];

  data.forEach(({ notification, user, reason_post, post }) => {
    for (const group of groupedNotifications) {
      if (
        ["like", "repost"].includes(notification.reason) &&
        group.notification.reason === notification.reason &&
        group.notification.reason_subject_id ===
          notification.reason_subject_id &&
        dayjs(group.notification.created_at).diff(
          dayjs(notification.created_at),
          "hour",
        ) < 48
      ) {
        group.additionalUsers.push(user);
        return;
      }
    }
    groupedNotifications.push({
      notification,
      user,
      reason_post,
      post,
      additionalUsers: [],
    });
  });

  return (
    <VirtualInfiniteList
      data={groupedNotifications}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
      isLoading={isLoading}
      getKey={(item) => item.notification.id}
      renderItem={(item) => (
        <NotificationItem
          notification={item.notification}
          user={item.user}
          reason_post={item.reason_post}
          post={item.post}
          additionalUsers={item.additionalUsers}
        />
      )}
    />
  );
}
