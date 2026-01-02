"use client";

import {
  IconBell,
  IconBookmark,
  IconHome,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  return (
    <nav className="flex w-full flex-col items-center gap-2 xl:items-start">
      <a
        href="/"
        className="group flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-gray-100"
      >
        <IconHome className="size-7" />

        <span className="hidden font-bold text-xl xl:block">Home</span>
      </a>
      <a
        href="#"
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-gray-100"
      >
        <IconBell className="size-7" />
        <span className="hidden text-xl xl:block">Notifications</span>
      </a>
      <a
        href="#"
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-gray-100"
      >
        <IconBookmark className="size-7" />
        <span className="hidden text-xl xl:block">Bookmarks</span>
      </a>
      <Link
        href={`/profile/${session?.user?.username}`}
        className="flex w-max items-center gap-4 rounded-full p-3 transition hover:bg-gray-100"
      >
        <IconUser className="size-7" />
        <span className="hidden text-xl xl:block">Profile</span>
      </Link>
    </nav>
  );
}
