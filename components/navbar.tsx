"use client";

import { authClient } from "@/lib/auth-client";
import { IconBell, IconHome, IconSearch, IconUser } from "@tabler/icons-react";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  return (
    <nav className="flex flex-col gap-2 items-center xl:items-start w-full">
      <a
        href="/"
        className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition group"
      >
        <IconHome className="size-7" />

        <span className="hidden xl:block text-xl font-bold">Home</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition"
      >
        <IconSearch className="size-7" />
        <span className="hidden xl:block text-xl">Explore</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition"
      >
        <IconBell className="size-7" />
        <span className="hidden xl:block text-xl">Notifications</span>
      </a>
      <a
        href="#"
        className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition"
      >
        <IconUser className="size-7" />
        <span className="hidden xl:block text-xl">Profile</span>
      </a>
    </nav>
  );
}
