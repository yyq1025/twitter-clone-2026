import { IconBrandX } from "@tabler/icons-react";
import PostsFeed from "@/components/posts-feed";

export default function Home() {
  return (
    <main className="flex-1 max-w-xl border-x border-gray-100 h-screen pb-20 sm:pb-0 flex flex-col">
      <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <div className="sm:hidden p-3 flex justify-center">
          <IconBrandX className="size-7" />
        </div>

        <div className="flex w-full">
          <div className="flex-1 hover:bg-gray-100 cursor-pointer p-4 text-center relative">
            <span className="font-bold">For you</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex-1 hover:bg-gray-100 cursor-pointer p-4 text-center">
            <span>Following</span>
          </div>
        </div>
      </div>

      <PostsFeed />
    </main>
  );
}
