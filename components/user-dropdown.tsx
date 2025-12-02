"use client";

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
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-full cursor-pointer w-max xl:w-full mb-2 transition"
        >
          <div className="w-10 h-10 rounded-full bg-gray-600" />
          <div className="hidden xl:block text-left">
            <p className="font-bold text-sm">{displayName}</p>
            <p className="text-sm">@{username}</p>
          </div>
          <div className="hidden xl:block ml-auto">...</div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          Log out {username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
