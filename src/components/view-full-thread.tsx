import { Button } from "@base-ui/react/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type { SelectPost, SelectUser } from "@/lib/validators";

interface ViewFullThreadProps {
  post: SelectPost;
  user: SelectUser;
}

export function ViewFullThread({ post, user }: ViewFullThreadProps) {
  const navigate = useNavigate();
  return (
    <Button
      className="flex w-full cursor-pointer items-center gap-2 px-4 py-1.5 transition hover:bg-gray-50"
      onClick={() => {
        navigate({
          to: "/profile/$username/post/$postId",
          params: { username: user.username!, postId: post.id },
        });
      }}
    >
      <div className="w-10">
        <IconDotsVertical className="mx-auto text-border" />
      </div>
      <span className="text-primary">View full thread</span>
    </Button>
  );
}
