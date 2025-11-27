import AuthGuard from "@/components/auth-guard";
import { UserDropdown } from "@/components/user-dropdown";
import { SignInDrawerDialog } from "@/components/sign-in-drawer-dialog";
import { Button } from "@/components/ui/button";
import {
  IconBrandX,
  IconHome,
  IconSearch,
  IconBell,
  IconFeatherFilled,
  IconMail,
  IconPhoto,
} from "@tabler/icons-react";
import { CreatePostDialog } from "@/components/create-post-dialog";
import PostsFeed from "@/components/posts-feed";

export default function Home() {
  return (
    <>
      <div className="flex justify-center h-screen max-w-7xl mx-auto">
        <header className="hidden sm:flex flex-col justify-between w-20 xl:w-2xs h-screen sticky top-0 px-2 py-4 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-4 items-center xl:items-start">
            <div className="p-3 hover:bg-gray-100 rounded-full cursor-pointer w-min transition">
              <IconBrandX className="size-7" />
            </div>

            <AuthGuard>
              <nav className="flex flex-col gap-2 items-center xl:items-start w-full">
                <a
                  href="#"
                  className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition group"
                >
                  <IconHome className="size-7" />

                  <span className="hidden xl:block text-xl font-bold">
                    Home
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition"
                >
                  <IconSearch className="size-7" />
                  <span className="hidden xl:block text-xl">Explore</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-full w-max transition"
                >
                  <IconBell className="size-7" />
                  <span className="hidden xl:block text-xl">Notifications</span>
                </a>
              </nav>

              <CreatePostDialog
                trigger={
                  <Button
                    size="lg"
                    className="w-min xl:w-[90%] rounded-full p-4 h-fit"
                  >
                    <span className="hidden xl:block font-bold text-lg">
                      Post
                    </span>
                    <IconFeatherFilled className="size-7 xl:hidden" />
                  </Button>
                }
              />
            </AuthGuard>
          </div>

          <UserDropdown />
        </header>

        <main className="flex-1 max-w-xl border-x border-border_color h-screen overflow-hidden no-scrollbar pb-20 sm:pb-0 flex flex-col">
          <div className="sticky top-0 z-10 bg-dark/80 backdrop-blur-md border-b border-border_color">
            <div className="sm:hidden p-3 flex justify-center">
              <IconBrandX className="size-7" />
            </div>

            <div className="flex w-full">
              <div className="flex-1 hover:bg-gray-100 cursor-pointer p-4 text-center relative">
                <span className="font-bold">For you</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 hover:bg-gray-100 cursor-pointer p-4 text-center text-gray_text">
                <span>Following</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex p-4 border-b border-border_color gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl outline-none placeholder-gray_text mb-4"
              />
              <div className="flex justify-between items-center border-t border-border_color pt-3">
                <div className="flex gap-4 text-blue-500">
                  <IconPhoto className="size-5" />
                </div>
                <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold opacity-50 cursor-not-allowed">
                  Post
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <PostsFeed />
          </div>
        </main>

        <aside className="hidden lg:block w-[350px] ml-8 py-2 h-screen sticky top-0 overflow-y-auto no-scrollbar">
          <div className="sticky top-0 bg-dark z-10 pb-2 pt-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray_text group-focus-within:text-blue-500">
                <IconSearch className="size-5" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 text-white rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-black border border-transparent focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl mt-4 overflow-hidden border border-border_color">
            <h3 className="font-bold text-xl p-4 pb-0">Who to follow</h3>

            <div className="p-4 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white"></div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">Google</p>
                <p className="text-gray_text text-sm truncate">@Google</p>
              </div>
              <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-200">
                Follow
              </button>
            </div>
            <div className="p-4 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500"></div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">NVIDIA</p>
                <p className="text-gray_text text-sm truncate">@nvidia</p>
              </div>
              <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-200">
                Follow
              </button>
            </div>
          </div>

          <div className="p-4 text-sm text-gray_text flex flex-wrap gap-x-2 leading-5">
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Cookie Policy
            </a>
            <span>© 2025 X Corp.</span>
          </div>
        </aside>
      </div>

      <AuthGuard
        fallback={
          <div className="fixed bottom-0 w-full bg-blue-500 text-white z-30">
            <div className="max-w-7xl mx-auto flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center p-4">
              <div>
                <p className="text-xl sm:text-2xl font-semibold">
                  Stay on top of what's happening
                </p>
                <p className="text-sm sm:text-base text-white/90">
                  People on X are the first to know.
                </p>
              </div>

              <SignInDrawerDialog
                trigger={
                  <Button className="rounded-full font-bold bg-white text-black hover:bg-gray-100">
                    Log in
                  </Button>
                }
              />
            </div>
          </div>
        }
      >
        <div className="sm:hidden fixed bottom-0 w-full bg-dark border-t border-border_color flex justify-around p-3 z-50">
          <a href="#" className="p-2">
            <IconHome className="size-6" />
          </a>
          <a href="#" className="p-2">
            <IconSearch className="size-6" />
          </a>
          <a href="#" className="p-2">
            <IconBell className="size-6" />
          </a>
          <a href="#" className="p-2">
            <IconMail className="size-6" />
          </a>
        </div>

        <CreatePostDialog
          trigger={
            <Button
              size="icon-lg"
              className="sm:hidden fixed bottom-20 right-4 rounded-full text-white z-50 p-3 size-fit"
            >
              <IconFeatherFilled className="size-6" />
            </Button>
          }
        />
      </AuthGuard>
    </>
  );
}
