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
      <div className="sticky top-0 z-20 flex h-14 items-center border-b bg-white/85 px-4 backdrop-blur-md">
        <div className="flex min-w-14 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="-m-2 rounded-full p-2"
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
        </div>
        <span className="font-semibold text-lg">Post</span>
      </div>
      <PostThread username={username} postId={postId} />
    </>
  );
}
