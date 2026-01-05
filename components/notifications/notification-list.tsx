"use client";

import { eq, useLiveInfiniteQuery } from "@tanstack/react-db";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { electricNotificationCollection } from "@/lib/collections";

const pageSize = 50;

export default function NotificationList() {
  const { data: session } = authClient.useSession();
  const [updating, setUpdating] = useState(false);
  const { data } = useLiveInfiniteQuery(
    (q) => {
      if (!session?.user?.id) {
        return q
          .from({ notification: electricNotificationCollection })
          .where(() => eq(1, 0))
          .orderBy(({ notification }) => notification.id, "desc");
      }
      return q
        .from({ notification: electricNotificationCollection })
        .where(({ notification }) =>
          eq(notification.recipient_id, session?.user?.id),
        )
        .orderBy(({ notification }) => notification.id, "desc");
    },
    {
      pageSize,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length : undefined,
    },
    [session?.user?.id],
  );

  useEffect(() => {
    if (
      data?.length &&
      session &&
      !updating &&
      data[0].id > (session.user.lastSeenNotificationId || 0)
    ) {
      setUpdating(true);
      authClient
        .updateUser({
          lastSeenNotificationId: data[0].id,
        })
        .finally(() => {
          setUpdating(false);
        });
    }
  }, [data, session, updating]);

  return <div>Notification List</div>;
}
