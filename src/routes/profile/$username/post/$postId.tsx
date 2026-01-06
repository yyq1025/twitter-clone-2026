import { IconArrowLeft } from "@tabler/icons-react";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import { PostThread } from "@/components/post-thread";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile/$username/post/$postId")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { username, postId } = Route.useParams();
  return (
    <>
      <div className="sticky top-0 z-20 border-b bg-white/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full p-2 transition hover:bg-muted"
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
          <span className="font-bold text-lg">Post</span>
        </div>
      </div>
      <PostThread username={username} postId={postId} />
    </>
  );
}
