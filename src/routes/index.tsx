import { Tabs } from "@base-ui/react/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, useEffect, useState } from "react";
import FollowingFeed from "@/components/home/following-feed";
import TimelineFeed from "@/components/home/timeline-feed";
import { authClient } from "@/lib/auth-client";
import {
  electricLikeCollection,
  electricRepostCollection,
} from "@/lib/collections";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { data: session } = await authClient.getSession();
    if (session?.user) {
      await Promise.all([
        electricLikeCollection.preload(),
        electricRepostCollection.preload(),
      ]);
    }

    return null;
  },
  component: App,
});

function App() {
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
