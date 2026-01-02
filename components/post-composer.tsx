import { IconPhoto, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Textarea } from "@/components/ui/textarea";
import { usePostMedia } from "@/hooks/use-post-media";
import { createPost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import type { SelectPost, SelectUser } from "@/lib/validators";
import { uploadFiles } from "@/utils/uploadthing";

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
      const uploadResponse = mediaFiles.length
        ? await uploadFiles("imageUploader", {
            files: mediaFiles.map((item) => item.file),
          })
        : [];

      const postMedia = uploadResponse.map((upload) => ({
        url: upload.ufsUrl,
        type: "image",
      }));

      createPost({
        payload: {
          id: uuidv7(),
          creator_id: session.user.id,
          content: content.trim(),
          reply_parent_id: parentPost?.id,
          media: postMedia,
          media_length: postMedia.length,
        },
        userId: session.user.id,
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
    <div className="flex w-full flex-col gap-4 py-3">
      <div className="max-h-[60vh] flex-1 overflow-y-auto px-4">
        {dialog && parentPost && parentUser && (
          <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex gap-3">
              <div className="size-10 rounded-full bg-gray-600" aria-hidden />
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-bold text-foreground hover:underline">
                    {parentUser.name || PLACEHOLDER_NAME}
                  </span>
                  <span>@{parentUser.username || PLACEHOLDER_HANDLE}</span>
                  {parentPost.created_at ? (
                    <>
                      <span>·</span>
                      <span>{formatPostTime(parentPost.created_at)}</span>
                    </>
                  ) : null}
                </div>
                <p className="wrap-break-word whitespace-pre-wrap leading-normal">
                  {parentPost.content}
                </p>
              </div>
            </div>
            <p className="mt-3 text-blue-500 text-sm">{`Replying to ${
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
                          className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
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
