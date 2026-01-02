"use client";

import { IconBrandX } from "@tabler/icons-react";
import dynamic from "next/dynamic";

const TimelineFeed = dynamic(() => import("@/components/timeline-feed"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex max-w-xl flex-1 flex-col border-gray-100 border-x">
      <div className="sticky top-0 z-10 border-gray-100 border-b bg-white/85 backdrop-blur-md">
        <div className="flex justify-center p-3 sm:hidden">
          <IconBrandX className="size-7" />
        </div>

        <div className="flex w-full">
          <div className="relative flex-1 cursor-pointer p-4 text-center hover:bg-gray-100">
            <span className="font-bold">For you</span>
            <div className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-blue-500"></div>
          </div>
          <div className="flex-1 cursor-pointer p-4 text-center hover:bg-gray-100">
            <span>Following</span>
          </div>
        </div>
      </div>

      <TimelineFeed />
    </main>
  );
}
