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
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { electricNotificationCollection } from "@/lib/collections";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = authClient.useSession();

  const { data: unreadNotifications } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) return null;
      return q
        .from({
          notification: electricNotificationCollection,
        })
        .where(({ notification }) =>
          and(
            eq(notification.recipient_id, session?.user?.id),
            gt(notification.id, session?.user?.lastSeenNotificationId || 0),
          ),
        );
    },
    [session],
  );

  return (
    <nav className="flex w-full flex-col items-center gap-2 xl:items-start">
      <Link
        to="/"
        activeProps={{ "aria-current": "page" }}
        className="flex items-center gap-4 rounded-full p-3 transition hover:bg-muted"
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <IconHomeFilled className="size-7" />
            ) : (
              <IconHome className="size-7" />
            )}

            <span
              className={cn("hidden text-xl xl:block", isActive && "font-bold")}
            >
              Home
            </span>
          </>
        )}
      </Link>
      <Link
        to="/notifications"
        activeProps={{ "aria-current": "page", className: "font-bold" }}
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted"
      >
        {({ isActive }) => (
          <>
            <div className="relative">
              {isActive ? (
                <IconBellFilled className="size-7" />
              ) : (
                <IconBell className="size-7" />
              )}
              {!!unreadNotifications?.length && (
                <Badge className="absolute -top-1.5 left-2.5 h-5 min-w-5 rounded-full px-1">
                  {unreadNotifications.length > 30
                    ? "30+"
                    : unreadNotifications.length}
                </Badge>
              )}
            </div>
            <span className="hidden text-xl xl:block">Notifications</span>
          </>
        )}
      </Link>
      <a
        href="#"
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted"
      >
        <IconBookmark className="size-7" />
        <span className="hidden text-xl xl:block">Bookmarks</span>
      </a>
      {session?.user.username && (
        <Link
          to="/profile/$username"
          params={{ username: session?.user.username }}
          activeProps={{ "aria-current": "page", className: "font-bold" }}
          activeOptions={{ exact: true }}
          className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-muted"
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <IconUserFilled className="size-7" />
              ) : (
                <IconUser className="size-7" />
              )}
              <span className="hidden text-xl xl:block">Profile</span>
            </>
          )}
        </Link>
      )}
    </nav>
  );
}
