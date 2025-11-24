import AuthGuard from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import {
  IconBrandX,
  IconHome,
  IconSearch,
  IconBell,
  IconFeatherFilled,
  IconMail,
  IconPhoto,
  IconMessage,
  IconRepeat,
  IconHeart,
  IconShare,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <>
      <div className="flex justify-center h-screen max-w-7xl mx-auto">
        <header className="hidden sm:flex flex-col justify-between w-20 xl:w-2xs h-screen sticky top-0 px-2 py-4 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-4 items-center xl:items-start">
            <div className="p-3 hover:bg-dark_dim rounded-full cursor-pointer w-min transition">
              <IconBrandX className="size-7" />
            </div>

            <nav className="flex flex-col gap-2 items-center xl:items-start w-full">
              <a
                href="#"
                className="flex items-center gap-4 p-3 hover:bg-dark_dim rounded-full w-max transition group"
              >
                <IconHome className="size-7" />

                <span className="hidden xl:block text-xl font-bold">主页</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-4 p-3 hover:bg-dark_dim rounded-full w-max transition"
              >
                <IconSearch className="size-7" />
                <span className="hidden xl:block text-xl">探索</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-4 p-3 hover:bg-dark_dim rounded-full w-max transition"
              >
                <IconBell className="size-7" />
                <span className="hidden xl:block text-xl">通知</span>
              </a>
            </nav>

            <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 xl:px-8 xl:py-4 w-min xl:w-[90%] shadow-lg transition">
              <span className="hidden xl:block font-bold text-lg">发帖</span>
              <IconFeatherFilled className="size-7 xl:hidden" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 hover:bg-dark_dim rounded-full cursor-pointer w-max xl:w-full mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-600"></div>
            <div className="hidden xl:block">
              <p className="font-bold text-sm">User Name</p>
              <p className="text-gray_text text-sm">@username</p>
            </div>
            <div className="hidden xl:block ml-auto">...</div>
          </div>
        </header>

        <main className="flex-1 max-w-xl border-x border-border_color h-screen overflow-y-auto no-scrollbar pb-20 sm:pb-0">
          <div className="sticky top-0 z-10 bg-dark/80 backdrop-blur-md border-b border-border_color">
            <div className="sm:hidden p-3 flex justify-center">
              <IconBrandX className="size-7" />
            </div>

            <div className="flex w-full">
              <div className="flex-1 hover:bg-dark_dim cursor-pointer p-4 text-center relative">
                <span className="font-bold">推荐</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 hover:bg-dark_dim cursor-pointer p-4 text-center text-gray_text">
                <span>关注</span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex p-4 border-b border-border_color gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0"></div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="有什么新鲜事？"
                className="w-full bg-transparent text-xl outline-none placeholder-gray_text mb-4"
              />
              <div className="flex justify-between items-center border-t border-border_color pt-3">
                <div className="flex gap-4 text-blue-500">
                  <IconPhoto className="size-5" />
                </div>
                <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold opacity-50 cursor-not-allowed">
                  发帖
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-border_color hover:bg-dark_dim/50 cursor-pointer transition flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex-shrink-0"></div>
            <div className="flex-1">
              <div className="flex gap-1 text-gray_text text-sm items-center">
                <span className="font-bold hover:underline">Tech Insider</span>
                <span>@techinsider</span>
                <span>·</span>
                <span>2h</span>
              </div>
              <p className="mt-1 leading-normal">
                Tailwind CSS 真是太棒了！用它来复刻界面非常快。⚡️{" "}
                <span className="text-blue-500">#coding #webdesign</span>
              </p>
              <div className="mt-3 rounded-xl h-48 w-full bg-gray-800 border border-border_color"></div>

              <div className="flex justify-between mt-3 max-w-md text-gray_text">
                <div className="hover:text-blue-500 flex gap-2 items-center group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                    <IconMessage className="size-4" />
                  </div>
                  24
                </div>
                <div className="hover:text-green-500 flex gap-2 items-center group">
                  <div className="p-2 rounded-full group-hover:bg-green-500/10">
                    <IconRepeat className="size-4" />
                  </div>
                  5
                </div>
                <div className="hover:text-pink-600 flex gap-2 items-center group">
                  <div className="p-2 rounded-full group-hover:bg-pink-600/10">
                    <IconHeart className="size-4" />
                  </div>
                  120
                </div>
                <div className="hover:text-blue-500 flex gap-2 items-center group">
                  <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                    <IconShare className="size-4" />
                  </div>
                </div>
              </div>
            </div>
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
                placeholder="搜索"
                className="w-full bg-dark_dim text-white rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-black border border-transparent focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="bg-dark_dim rounded-2xl mt-4 overflow-hidden border border-border_color">
            <h3 className="font-bold text-xl p-4 pb-0">推荐关注</h3>

            <div className="p-4 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white"></div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">Google</p>
                <p className="text-gray_text text-sm truncate">@Google</p>
              </div>
              <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-200">
                关注
              </button>
            </div>
            <div className="p-4 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500"></div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">NVIDIA</p>
                <p className="text-gray_text text-sm truncate">@nvidia</p>
              </div>
              <button className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:bg-gray-200">
                关注
              </button>
            </div>
          </div>

          <div className="p-4 text-sm text-gray_text flex flex-wrap gap-x-2 leading-5">
            <a href="#" className="hover:underline">
              服务条款
            </a>
            <a href="#" className="hover:underline">
              隐私政策
            </a>
            <a href="#" className="hover:underline">
              Cookie 政策
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
                  新鲜事一网打尽
                </p>
                <p className="text-sm sm:text-base text-white/90">
                  X 上的用户能够抢先知道。
                </p>
              </div>

              <Button className="rounded-full font-bold bg-white text-black hover:bg-gray-100">
                登录
              </Button>
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

        <button className="sm:hidden fixed bottom-20 right-4 bg-blue-500 p-4 rounded-full shadow-lg text-white z-50">
          <IconFeatherFilled className="size-6" />
        </button>
      </AuthGuard>
    </>
  );
}
