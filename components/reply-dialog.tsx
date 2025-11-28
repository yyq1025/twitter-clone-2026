"use client";

import { useMemo, useState, type ReactNode } from "react";
import { IconPhoto, IconX } from "@tabler/icons-react";
import type * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputGroupButton } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { createPost } from "@/lib/actions";
import { uploadFiles } from "@/utils/uploadthing";
import type { InsertPostMedia } from "@/db/validation";
import type {
  selectPostSchema,
  selectUserSchema,
} from "@/db/validation";
import { getImageDimensions, usePostMedia } from "@/hooks/use-post-media";

const PLACEHOLDER_NAME = "Demo User";
const PLACEHOLDER_HANDLE = "@demo_user";

function formatPostTime(value: Date | string | number | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  }).format(date);
}

type ReplyDialogProps = {
  trigger: ReactNode;
  parentPost: z.infer<typeof selectPostSchema>;
  parentUser: z.infer<typeof selectUserSchema>;
  initialContent?: string;
  onSubmitted?: () => void;
};

export function ReplyDialog({
  trigger,
  parentPost,
  parentUser,
  initialContent = "",
  onSubmitted,
}: ReplyDialogProps) {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState(initialContent);

  const {
    mediaFiles,
    mediaError,
    fileInputRef,
    handleMediaChange,
    handleRemoveMedia,
    cleanupMedia,
  } = usePostMedia();

  const replyingToLabel = useMemo(() => {
    const name = parentUser.name ?? PLACEHOLDER_NAME;
    return `Replying to ${name}`;
  }, [parentUser.name]);

  const onSubmit = async () => {
    if (!session?.user) return;
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const [uploadResponse, dimensions] = await Promise.all([
        uploadFiles("imageUploader", {
          files: mediaFiles.map((item) => item.file),
        }),
        Promise.all(
          mediaFiles.map(async (item) => await getImageDimensions(item.file))
        ),
      ]);

      const postMedia: InsertPostMedia[] = uploadResponse.map(
        (upload, index) => ({
          mediaUrl: upload.ufsUrl,
          mediaType: "image",
          sortOrder: index,
          width: dimensions[index].width,
          height: dimensions[index].height,
        })
      );

      createPost({
        userId: session.user.id,
        content: content.trim(),
        replyToId: parentPost.id,
        postMedia,
      });
      setContent("");
      cleanupMedia();
      setOpen(false);
      onSubmitted?.();
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          cleanupMedia();
          setContent(initialContent);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reply</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex gap-3">
              <div className="size-10 rounded-full bg-gray-600" aria-hidden />
              <div className="space-y-1 text-sm">
                <div className="flex gap-1 text-sm items-center">
                  <span className="font-bold hover:underline text-foreground">
                    {parentUser.name ?? PLACEHOLDER_NAME}
                  </span>
                  <span>{PLACEHOLDER_HANDLE}</span>
                  {parentPost.createdAt ? (
                    <>
                      <span>·</span>
                      <span>{formatPostTime(parentPost.createdAt)}</span>
                    </>
                  ) : null}
                </div>
                <p className="leading-normal whitespace-pre-wrap break-words">
                  {parentPost.content}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-blue-500">{replyingToLabel}</p>
          </div>

          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-gray-600" aria-hidden />
            <div className="flex-1 space-y-2">
              <Textarea
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Post your reply"
                aria-label="Reply content"
                maxLength={280}
              />
              {mediaFiles.length ? (
                <Carousel opts={{ loop: false, align: "start" }}>
                  <CarouselContent className="-ml-2">
                    {mediaFiles.map((item) => (
                      <CarouselItem
                        key={item.previewUrl}
                        className="basis-2/5 pl-2"
                      >
                        <div className="relative overflow-hidden rounded-lg border">
                          <button
                            type="button"
                            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                            aria-label="Remove media"
                            onClick={() => handleRemoveMedia(item.previewUrl)}
                          >
                            <IconX className="size-4" />
                          </button>
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="h-48 w-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter className="items-center gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleMediaChange}
              aria-label="Choose images"
            />
            <InputGroupButton
              size="icon-sm"
              variant="ghost"
              aria-label="Add image"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPhoto className="size-4" />
            </InputGroupButton>
            {mediaFiles.length ? (
              <span className="text-xs">Selected {mediaFiles.length} / 4</span>
            ) : null}
            {mediaError ? (
              <span className="text-xs text-red-500">{mediaError}</span>
            ) : null}
          </div>

          <Button
            className="rounded-full px-5 font-semibold"
            disabled={!content.trim() || submitting}
            onClick={onSubmit}
          >
            Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
