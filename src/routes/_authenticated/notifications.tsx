import { IconArrowLeft } from "@tabler/icons-react";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import NotificationList from "@/components/notifications/notification-list";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
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
          <span className="font-bold text-lg">Notifications</span>
        </div>
      </div>
      <NotificationList />
    </>
  );
}
