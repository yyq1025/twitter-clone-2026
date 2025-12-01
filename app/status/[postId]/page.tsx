import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { StatusThread } from "@/components/status-thread";
import { use } from "react";

export default function StatusPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const postId = use(params).postId;

  return (
    <main className="flex-1 max-w-xl border-x">
      <div className="sticky top-0 z-10 bg-dark/85 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          replace
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Back to home"
        >
          <IconArrowLeft className="size-5" />
        </Link>
        <span className="text-lg font-bold">Post</span>
      </div>
      <StatusThread postId={Number(postId)} />
    </main>
  );
}
