"use client";

import { IconX } from "@tabler/icons-react";
import type { ReactElement } from "react";
import { PostComposer } from "@/components/post-composer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useControllableState } from "@/hooks/use-controllable-state";
import type { SelectPost, SelectUser } from "@/lib/validators";

type CreatePostDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  parentPost?: SelectPost;
  parentUser?: SelectUser;
};

export function CreatePostDialog({
  open,
  onOpenChange,
  trigger,
  parentPost,
  parentUser,
}: CreatePostDialogProps) {
  const [dialogOpen, setDialogOpen] = useControllableState({
    value: open,
    defaultValue: false,
    onChange: onOpenChange,
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className="gap-0 p-0 sm:max-w-xl"
        showCloseButton={false}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="p-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setDialogOpen(false)}
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
            setDialogOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
