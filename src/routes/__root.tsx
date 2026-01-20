import {
  IconBell,
  IconBellFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconBrandTwitter,
  IconFeatherFilled,
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Activity } from "react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import Navbar from "@/components/navbar";
import { SignInDrawerDialog } from "@/components/sign-in-drawer-dialog";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import { VirtualizerContainer } from "@/components/virtualizer-container";
import { authClient } from "@/lib/auth-client";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    return { user: session?.user };
  },
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  const { user } = Route.useRouteContext();
  return (
    <VirtualizerContainer className="flex flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 justify-center">
        <header className="sticky top-0 hidden h-screen w-20 flex-col justify-between gap-4 overflow-auto px-2 py-4 sm:flex xl:w-2xs">
          <div className="flex flex-col items-center gap-4 xl:items-start">
            <div className="w-min cursor-pointer rounded-full p-3 transition hover:bg-gray-100">
              <IconBrandTwitter className="size-7" />
            </div>

            <Activity mode={user ? "visible" : "hidden"}>
              <Navbar />

              <CreatePostDialog
                trigger={
                  <Button
                    size="lg"
                    className="h-fit w-min rounded-full p-4 xl:w-[90%]"
                    data-testid="desktop-post-trigger"
                  >
                    <span className="hidden font-bold text-lg xl:block">
                      Post
                    </span>
                    <IconFeatherFilled className="size-7 xl:hidden" />
                  </Button>
                }
              />
            </Activity>
          </div>
          <UserDropdown />
        </header>
        <main className="max-w-xl flex-1 border-x">
          <Outlet />
        </main>
        <aside className="sticky top-0 ml-8 hidden h-screen w-87.5 py-2 lg:block">
          <div className="sticky top-0 z-10 bg-white pt-1 pb-2">
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 group-focus-within:text-blue-500">
                <IconSearch className="size-5" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full border border-transparent bg-gray-100 py-3 pr-4 pl-10 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </aside>
      </div>
      {!user && (
        <div className="fixed bottom-0 z-30 w-full bg-blue-500 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-xl sm:text-2xl">
                Don't miss what's happening
              </p>
              <p className="text-sm text-white/90 sm:text-base">
                People on X are the first to know.
              </p>
            </div>

            <SignInDrawerDialog
              trigger={
                <Button className="rounded-full bg-white font-bold text-black hover:bg-gray-100">
                  Log in
                </Button>
              }
            />
          </div>
        </div>
      )}
      <Activity mode={user ? "visible" : "hidden"}>
        <div
          className="sticky bottom-0 z-50 flex w-full justify-around border-gray-100 border-t bg-white/85 p-3 backdrop-blur-md sm:hidden"
          data-testid="mobile-bottom-nav"
        >
          <Link
            to="/"
            className="p-2"
            activeProps={{
              "aria-current": "page",
            }}
          >
            {({ isActive }) =>
              isActive ? (
                <IconHomeFilled className="size-6" />
              ) : (
                <IconHome className="size-6" />
              )
            }
          </Link>
          <Link
            to="/notifications"
            className="p-2"
            activeProps={{
              "aria-current": "page",
            }}
          >
            {({ isActive }) =>
              isActive ? (
                <IconBellFilled className="size-6" />
              ) : (
                <IconBell className="size-6" />
              )
            }
          </Link>
          <Link
            to="/bookmarks"
            className="p-2"
            activeProps={{
              "aria-current": "page",
            }}
          >
            {({ isActive }) =>
              isActive ? (
                <IconBookmarkFilled className="size-6" />
              ) : (
                <IconBookmark className="size-6" />
              )
            }
          </Link>
          {user?.username && (
            <Link
              to="/profile/$username"
              params={{ username: user.username }}
              activeProps={{ "aria-current": "page" }}
              activeOptions={{ exact: true }}
              className="p-2"
            >
              {({ isActive }) =>
                isActive ? (
                  <IconUserFilled className="size-6" />
                ) : (
                  <IconUser className="size-6" />
                )
              }
            </Link>
          )}
        </div>

        <CreatePostDialog
          trigger={
            <Button
              size="icon-lg"
              className="fixed right-4 bottom-20 z-50 size-fit rounded-full p-3 text-white sm:hidden"
              data-testid="mobile-post-trigger"
            >
              <IconFeatherFilled className="size-6" />
            </Button>
          }
        />
      </Activity>
    </VirtualizerContainer>
  );
}
