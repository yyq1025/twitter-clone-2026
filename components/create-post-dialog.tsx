"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { IconHash, IconPhoto, IconX } from "@tabler/icons-react";
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
import { authClient } from "@/lib/auth-client";
import { Textarea } from "@/components/ui/textarea";
import { uploadFiles } from "@/utils/uploadthing";
import { createPost } from "@/lib/actions";
import type { InsertPostMedia } from "@/db/validation";

const getImageDimensions = (
  file: File
): Promise<{
  width: number;
  height: number;
}> => {
  return new Promise((resolve) => {
    // 1. Safety check: return zero dimensions if the file is not an image
    if (!file.type.startsWith("image/")) {
      console.warn(`File ${file.name} is not an image, skipping dimension lookup.`);
      resolve({ width: 0, height: 0 });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      console.error(`Unable to read image dimensions: ${file.name}`);
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  });
};

type CreatePostDialogProps = {
  trigger: React.ReactNode;
};

export function CreatePostDialog({ trigger }: CreatePostDialogProps) {
  const { data: session } = authClient.useSession();
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      setMediaError(null);
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    for (const file of files) {
      const isSupportedType = file.type.startsWith("image/");
      if (!isSupportedType) {
        setMediaError("Only images are supported.");
        event.target.value = "";
        return;
      }
      if (file.size > maxSizeBytes) {
        setMediaError("Each file must be smaller than 30MB.");
        event.target.value = "";
        return;
      }
    }

    let exceededLimit = false;
    setMediaFiles((prev) => {
      if (prev.length + files.length > 4) {
        exceededLimit = true;
        return prev;
      }
      return [
        ...prev,
        ...files.map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });

    setMediaError(exceededLimit ? "You can upload up to 4 media files." : null);
    event.target.value = "";
  };

  const handleRemoveMedia = (previewUrl: string) => {
    setMediaFiles((prev) => {
      const toRemove = prev.find((item) => item.previewUrl === previewUrl);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.previewUrl);
      }
      return prev.filter((item) => item.previewUrl !== previewUrl);
    });
  };

  const cleanupMedia = () => {
    mediaFiles.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
    });
    setMediaFiles([]);
    setMediaError(null);
  };

  const onSubmit = async () => {
    try {
      if (!session?.user) {
        return;
      }
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
        postMedia,
      });
      cleanupMedia();
      setContent("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create post:", error);
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
          setContent("");
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-gray-600" aria-hidden />

          <div className="flex-1 space-y-2">
            <Textarea
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What's happening?"
              aria-label="New post content"
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
              <span className="text-xs text-gray_text">
                Selected {mediaFiles.length} / 4
              </span>
            ) : null}
            {mediaError ? (
              <span className="text-xs text-red-500">{mediaError}</span>
            ) : null}
            <InputGroupButton
              size="icon-sm"
              variant="ghost"
              aria-label="Add hashtag"
            >
              <IconHash className="size-4" />
            </InputGroupButton>
          </div>

          <Button
            className="rounded-full px-5 font-semibold"
            disabled={!content.trim() || submitting}
            onClick={onSubmit}
          >
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
