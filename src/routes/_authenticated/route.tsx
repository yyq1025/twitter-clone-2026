import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/",
        replace: true,
      });
    }
    return { user: context.user };
  },
  component: () => <Outlet />,
});
