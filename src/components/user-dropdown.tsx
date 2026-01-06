import { IconDots } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function UserDropdown() {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const displayName = session.user.name ?? "User Name";
  const username = session.user.username ?? "username";

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="mb-2 flex w-max cursor-pointer items-center gap-3 rounded-full p-3 transition hover:bg-gray-100 xl:w-full"
          >
            <Avatar>
              <AvatarImage
                src={session.user.image || undefined}
                alt={session.user.name || "User"}
              />
              <AvatarFallback>
                {session.user.name ? session.user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left xl:block">
              <p className="font-bold text-sm">{displayName}</p>
              <p className="text-sm">@{username}</p>
            </div>
            <div className="ml-auto hidden xl:block">
              <IconDots />
            </div>
          </button>
        }
      />
      <DropdownMenuContent side="top">
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          Log out {username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
