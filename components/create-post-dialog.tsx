"use client";

import { useState, type ReactNode } from "react";
import type * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { selectPostSchema, selectUserSchema } from "@/db/validation";
import { PostComposer } from "@/components/post-composer";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

type CreatePostDialogProps = {
  trigger: ReactNode;
  parentPost?: z.infer<typeof selectPostSchema>;
  parentUser?: z.infer<typeof selectUserSchema>;
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
      <DialogContent className="sm:max-w-xl p-0 gap-0" showCloseButton={false}>
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
