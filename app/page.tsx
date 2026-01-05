"use client";

import { Tabs } from "@base-ui/react/tabs";
import dynamic from "next/dynamic";

const TimelineFeed = dynamic(() => import("@/components/home/timeline-feed"), {
  ssr: false,
});

const FollowingFeed = dynamic(
  () => import("@/components/home/following-feed"),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <Tabs.Root defaultValue="for-you">
      <Tabs.List className="sticky top-0 z-10 flex border-b bg-white/85 backdrop-blur-md">
        <Tabs.Tab
          value="for-you"
          className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
        >
          <span>For you</span>
          <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
        </Tabs.Tab>
        <Tabs.Tab
          value="following"
          className="relative flex grow cursor-pointer justify-center py-4 text-center font-semibold text-muted-foreground outline-none transition hover:bg-gray-50 data-active:text-black data-active:*:opacity-100"
        >
          <span>Following</span>
          <span className="absolute -bottom-px h-1 w-14 rounded-full bg-primary opacity-0 transition" />
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="for-you">
        <TimelineFeed />
      </Tabs.Panel>

      <Tabs.Panel value="following">
        <FollowingFeed />
      </Tabs.Panel>
    </Tabs.Root>
  );
}
