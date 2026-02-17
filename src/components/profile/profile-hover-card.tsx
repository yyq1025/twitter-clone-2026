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
import {
  electricFollowCollection,
  electricUserCollection,
} from "@/lib/collections";

function ProfileCard({ username }: { username: string }) {
  const { data: session } = authClient.useSession();
  const { data: user, isLoading: isUserLoading } = useLiveQuery(
    (q) => {
      if (!username) {
        return null;
      }
      return q
        .from({ user: electricUserCollection })
        .where(({ user }) => eq(user.username, username))
        .findOne();
    },
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
    [session?.user?.id, user?.id],
  );

  if (isUserLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!user) {
    return (
      <div>
        <p className="font-semibold leading-tight">User not found</p>
        <p className="text-muted-foreground leading-tight">@{username}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <Link to="/profile/$username" params={{ username }}>
          <Avatar className="size-14">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="text-xl">
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
      <div>
        <Link to="/profile/$username" params={{ username }}>
          <p className="font-semibold text-base leading-tight hover:underline">
            {user.name}
          </p>
        </Link>
        <Link to="/profile/$username" params={{ username }}>
          <p className="text-muted-foreground leading-tight">
            @{user.username}
          </p>
        </Link>
      </div>
      {user.bio && <p className="leading-tight">{user.bio}</p>}
      <div className="flex gap-3">
        <div className="flex gap-1">
          <span className="font-semibold">{user.followsCount || 0}</span>
          <span className="text-muted-foreground">following</span>
        </div>
        <div className="flex gap-1">
          <span className="font-semibold">{user.followersCount || 0}</span>
          <span className="text-muted-foreground">followers</span>
        </div>
      </div>
    </>
  );
}

interface ProfileHoverCardProps {
  trigger: ReactElement;
  username: string;
}

export default function ProfileHoverCard({
  trigger,
  username,
}: ProfileHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <Link
            to="/profile/$username"
            params={{ username }}
            onClick={(e) => e.stopPropagation()}
          >
            {trigger}
          </Link>
        }
      />
      <HoverCardContent
        className="grid w-72 gap-3 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <ProfileCard username={username} />
      </HoverCardContent>
    </HoverCard>
  );
}
