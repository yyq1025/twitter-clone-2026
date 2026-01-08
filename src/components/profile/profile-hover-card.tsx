import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { SelectUser } from "@/lib/validators";

interface ProfileHoverCardProps {
  trigger: ReactElement;
  user: SelectUser;
}

export default function ProfileHoverCard({
  trigger,
  user,
}: ProfileHoverCardProps) {
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
          <Button size="sm">Follow</Button>
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
