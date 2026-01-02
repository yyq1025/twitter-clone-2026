import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-gray-100 border-b bg-white/85 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          replace
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Back to home"
        >
          <IconArrowLeft className="size-5" />
        </Link>
        <span className="font-bold text-lg">Post</span>
      </div>
      {children}
    </>
  );
}
