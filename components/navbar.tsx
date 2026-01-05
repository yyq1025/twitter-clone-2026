"use client";

import {
  IconBell,
  IconBellFilled,
  IconBookmark,
  IconHome,
  IconHomeFilled,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";
import { and, eq, gt, useLiveQuery } from "@tanstack/react-db";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { electricNotificationCollection } from "@/lib/collections";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const { data: unreadNotifications } = useLiveQuery(
    (q) =>
      q
        .from({
          notification: electricNotificationCollection,
        })
        .where(({ notification }) =>
          and(
            eq(notification.recipient_id, session?.user?.id),
            gt(notification.id, session?.user?.lastSeenNotificationId || 0),
          ),
        ),
    [session],
  );

  return (
    <nav className="flex w-full flex-col items-center gap-2 xl:items-start">
      <Link
        href="/"
        data-active={pathname === "/" ? "true" : "false"}
        aria-current={pathname === "/" ? "page" : undefined}
        className="group flex items-center gap-4 rounded-full p-3 transition hover:bg-muted data-[active=true]:font-bold"
      >
        <IconHome className="size-7 group-data-[active=true]:hidden" />
        <IconHomeFilled className="hidden size-7 group-data-[active=true]:block" />

        <span className="hidden text-xl xl:block">Home</span>
      </Link>
      <Link
        href="/notifications"
        data-active={pathname === "/notifications" ? "true" : "false"}
        aria-current={pathname === "/notifications" ? "page" : undefined}
        className="group flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted data-[active=true]:font-bold"
      >
        <div className="relative">
          <IconBell className="size-7 group-data-[active=true]:hidden" />
          <IconBellFilled className="hidden size-7 group-data-[active=true]:block" />
          {unreadNotifications?.length > 0 && (
            <Badge className="absolute -top-1.5 left-2.5 h-5 min-w-5 rounded-full px-1">
              {unreadNotifications.length > 30
                ? "30+"
                : unreadNotifications.length}
            </Badge>
          )}
        </div>
        <span className="hidden text-xl xl:block">Notifications</span>
      </Link>
      <a
        href="#"
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted"
      >
        <IconBookmark className="size-7" />
        <span className="hidden text-xl xl:block">Bookmarks</span>
      </a>
      <Link
        href={`/profile/${session?.user?.username}`}
        data-active={
          pathname === `/profile/${session?.user?.username}` ? "true" : "false"
        }
        aria-current={
          pathname === `/profile/${session?.user?.username}`
            ? "page"
            : undefined
        }
        className="group flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted data-[active=true]:font-bold"
      >
        <IconUser className="size-7 group-data-[active=true]:hidden" />
        <IconUserFilled className="hidden size-7 group-data-[active=true]:block" />
        <span className="hidden text-xl xl:block">Profile</span>
      </Link>
    </nav>
  );
}
