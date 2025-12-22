"use client";

import { IconX } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import { PostComposer } from "@/components/post-composer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SelectPost, SelectUser } from "@/db/validation";

type CreatePostDialogProps = {
  trigger: ReactNode;
  parentPost?: SelectPost;
  parentUser?: SelectUser;
};

export function CreatePostDialog({
  trigger,
  parentPost,
  parentUser,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-xl p-0 gap-0"
        showCloseButton={false}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="p-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setOpen(false)}
          >
            <IconX className="size-5" />
          </Button>
          <DialogTitle className="sr-only">
            {parentPost ? "Reply" : "Create Post"}
          </DialogTitle>
        </DialogHeader>

        <PostComposer
          parentPost={parentPost}
          parentUser={parentUser}
          dialog
          onPosted={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
