import { IconPhoto, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Textarea } from "@/components/ui/textarea";
import type { SelectPost, SelectUser } from "@/db/validation";
import { getImageDimensions, usePostMedia } from "@/hooks/use-post-media";
import { createPost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import { uploadFiles } from "@/utils/uploadthing";
import { v7 as uuidv7 } from "uuid";

const PLACEHOLDER_NAME = "Demo User";
const PLACEHOLDER_HANDLE = "demo_user";

function formatPostTime(value: Date | string | number | null | undefined) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

interface PostComposerProps {
  parentPost?: SelectPost;
  parentUser?: SelectUser;
  dialog?: boolean;
  onPosted?: () => void;
}

export function PostComposer({
  parentPost,
  parentUser,
  dialog = false,
  onPosted,
}: PostComposerProps) {
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    mediaFiles,
    fileInputRef,
    handleMediaChange,
    handleRemoveMedia,
    cleanupMedia,
  } = usePostMedia();

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

      const postMedia = uploadResponse.map((upload, index) => ({
        url: upload.ufsUrl,
        type: "image",
        width: dimensions[index].width,
        height: dimensions[index].height,
      }));

      createPost({
        id: uuidv7(),
        userId: session.user.id,
        content: content.trim(),
        replyToId: parentPost?.id,
        postMedia,
      });
      setContent("");
      cleanupMedia();
      onPosted?.();
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
    };
  }, [cleanupMedia]);

  return (
    <div className="flex flex-col gap-4 py-3 w-full">
      <div className="max-h-[60vh] flex-1 px-4 overflow-y-auto">
        {dialog && parentPost && parentUser && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 mb-4">
            <div className="flex gap-3">
              <div className="size-10 rounded-full bg-gray-600" aria-hidden />
              <div className="space-y-1 text-sm">
                <div className="flex gap-1 text-sm items-center">
                  <span className="font-bold hover:underline text-foreground">
                    {parentUser.name || PLACEHOLDER_NAME}
                  </span>
                  <span>@{parentUser.username || PLACEHOLDER_HANDLE}</span>
                  {parentPost.createdAt ? (
                    <>
                      <span>·</span>
                      <span>{formatPostTime(parentPost.createdAt)}</span>
                    </>
                  ) : null}
                </div>
                <p className="leading-normal whitespace-pre-wrap wrap-break-word">
                  {parentPost.content}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-blue-500">{`Replying to ${
              parentUser.name || PLACEHOLDER_NAME
            }`}</p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-gray-600" aria-hidden />
          <div className="flex-1 space-y-2">
            <Textarea
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={parentPost ? "Post your reply" : "What's happening?"}
              aria-label={parentPost ? "Post your reply" : "What's happening?"}
              maxLength={280}
            />
            {!!mediaFiles.length && (
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
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-1 items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleMediaChange}
            aria-label="Choose images"
          />
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Add image"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconPhoto className="size-4" />
          </Button>
        </div>

        <Button
          className="rounded-full px-5 font-semibold"
          disabled={!content.trim() || submitting}
          onClick={onSubmit}
        >
          {parentPost ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );
}
