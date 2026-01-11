import { IconArrowLeft } from "@tabler/icons-react";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import BookmarkList from "@/components/bookmarks/bookmark-list";
import { Button } from "@/components/ui/button";
import {
  electricBookmarkCollection,
  electricLikeCollection,
  electricRepostCollection,
} from "@/lib/collections";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  loader: async ({ context }) => {
    await Promise.all([
      electricLikeCollection.preload(),
      electricBookmarkCollection.preload(),
      electricRepostCollection.preload(),
    ]);
    return context;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user } = Route.useLoaderData();
  return (
    <>
      <div className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full p-2"
            aria-label="Back"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                router.navigate({ to: "/", replace: true });
              }
            }}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <span className="font-semibold text-lg">Bookmarks</span>
        </div>
      </div>
      <BookmarkList userId={user.id} />
    </>
  );
}
