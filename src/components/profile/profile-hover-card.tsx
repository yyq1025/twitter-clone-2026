import { and, eq, useLiveQuery } from "@tanstack/react-db";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { mutateFollow } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { electricFollowCollection } from "@/lib/collections";
import type { SelectUser } from "@/lib/validators";

interface ProfileHoverCardProps {
  trigger: ReactElement;
  user: SelectUser;
}

export default function ProfileHoverCard({
  trigger,
  user,
}: ProfileHoverCardProps) {
  const { data: session } = authClient.useSession();

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
    [session?.user?.id, user.id],
  );

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <Link
            to="/profile/$username"
            params={{ username: user.username || "" }}
            onClick={(e) => e.stopPropagation()}
          >
            {trigger}
          </Link>
        }
      />
      <HoverCardContent
        className="w-72 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <Link
            to="/profile/$username"
            params={{ username: user.username || "" }}
          >
            <Avatar className="size-14">
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback className="text-4xl">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          {session?.user ? (
            userFollowing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  mutateFollow({
                    type: "user.unfollow",
                    payload: {
                      subject_id: user.id,
                    },
                    userId: session.user.id,
                  })
                }
              >
                Following
              </Button>
            ) : (
              session.user.id !== user.id && (
                <Button
                  size="sm"
                  onClick={() =>
                    mutateFollow({
                      type: "user.follow",
                      payload: {
                        subject_id: user.id,
                      },
                      userId: session.user.id,
                    })
                  }
                >
                  Follow
                </Button>
              )
            )
          ) : null}
        </div>
        <Link
          to="/profile/$username"
          params={{ username: user.username || "" }}
        >
          <p className="mt-2 font-semibold text-base leading-tight hover:underline">
            {user.name}
          </p>
        </Link>
        <Link
          to="/profile/$username"
          params={{ username: user.username || "" }}
        >
          <p className="text-muted-foreground leading-tight">
            @{user.username}
          </p>
        </Link>
        {user.bio && <p className="mt-2 leading-tight">{user.bio}</p>}
      </HoverCardContent>
    </HoverCard>
  );
}
