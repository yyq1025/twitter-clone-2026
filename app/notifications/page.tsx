import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white/85 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          replace
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Back to home"
        >
          <IconArrowLeft className="size-5" />
        </Link>
        <span className="font-bold text-lg">Notifications</span>
      </div>
      <div>Notifications Page</div>
    </>
  );
}
