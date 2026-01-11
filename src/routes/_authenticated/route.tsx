import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.user) {
      throw redirect({
        to: "/",
        replace: true,
      });
    }
    return { user: session.user };
  },
  component: () => <Outlet />,
});
