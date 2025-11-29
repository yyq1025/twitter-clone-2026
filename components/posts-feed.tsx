"use client";

import {
  eq,
  isNull,
  useLiveInfiniteQuery,
  useLiveQuery,
} from "@tanstack/react-db";
import {
  electricPostCollection,
  electricUserCollection,
  electricLikeCollection,
  electricPostMediaCollection,
} from "@/lib/collections";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { IconPhoto, IconX } from "@tabler/icons-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { InputGroupButton } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/actions";
import type { InsertPostMedia } from "@/db/validation";
import { getImageDimensions, usePostMedia } from "@/hooks/use-post-media";
import { uploadFiles } from "@/utils/uploadthing";
import { Textarea } from "@/components/ui/textarea";
import { PostItem } from "@/components/post-item";

export default function PostsFeed() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      electricPostCollection.preload(),
      electricUserCollection.preload(),
      electricLikeCollection.preload(),
      electricPostMediaCollection.preload(),
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 text-sm">Loading posts, please wait...</div>;
  }

  return <PostsList />;
}

function PostsList() {
  const { data: session } = authClient.useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    mediaFiles,
    mediaError,
    fileInputRef,
    handleMediaChange,
    handleRemoveMedia,
    cleanupMedia,
  } = usePostMedia();
  const {
    pages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    isLoading,
  } = useLiveInfiniteQuery(
    (q) =>
      q
        .from({ post: electricPostCollection })
        .innerJoin({ user: electricUserCollection }, ({ post, user }) =>
          eq(user.id, post.userId)
        )
        .where(({ post }) => isNull(post.replyToId))
        .orderBy(({ post }) => post.createdAt, "desc"),
    {
      pageSize: 20,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 20 ? allPages.length : undefined,
    }
  );

  const posts = pages.flat();

  const { data: userLikes } = useLiveQuery(
    (q) => {
      if (!session?.user?.id) {
        return null;
      }
      return q
        .from({ like: electricLikeCollection })
        .where(({ like }) => eq(like.userId, session.user.id));
    },
    [session?.user?.id]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? posts.length + 1 : posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!items.length) {
      return;
    }
    const lastItem = items[items.length - 1];
    if (
      lastItem.index >= posts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [items, hasNextPage, fetchNextPage, isFetchingNextPage, posts.length]);

  const isAuthenticated = Boolean(session?.user);
  const trimmedContent = content.trim();
  const canSubmit =
    isAuthenticated && (Boolean(trimmedContent) || mediaFiles.length > 0);

  const handleSubmit = async () => {
    if (!session?.user) return;
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      let postMedia: InsertPostMedia[] = [];

      if (mediaFiles.length) {
        const [uploadResponse, dimensions] = await Promise.all([
          uploadFiles("imageUploader", {
            files: mediaFiles.map((item) => item.file),
          }),
          Promise.all(mediaFiles.map((item) => getImageDimensions(item.file))),
        ]);

        postMedia = uploadResponse.map((upload, index) => ({
          mediaUrl: upload.ufsUrl,
          mediaType: "image",
          sortOrder: index,
          width: dimensions[index].width,
          height: dimensions[index].height,
        }));
      }

      await createPost({
        userId: session.user.id,
        content: trimmedContent,
        postMedia,
      });

      setContent("");
      cleanupMedia();
    } catch (error) {
      console.error("Failed to submit post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={parentRef} className="h-full overflow-y-auto contain-strict">
      <div className="hidden sm:flex p-4 border-b border-gray-100 gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-600 shrink-0"></div>
        <div className="flex-1">
          <div className="space-y-4">
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

            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex flex-wrap items-center gap-3 text-blue-500">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleMediaChange}
                />
                <InputGroupButton
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Add image"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconPhoto className="size-5" />
                </InputGroupButton>
                {!!mediaFiles.length && (
                  <span className="text-xs text-foreground">
                    Selected {mediaFiles.length} / 4
                  </span>
                )}
                {mediaError && (
                  <span className="text-xs text-red-500">{mediaError}</span>
                )}
              </div>
              <Button
                className="rounded-full px-5 font-semibold"
                disabled={!content.trim() || submitting}
                onClick={handleSubmit}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {isError ? (
            <div className="p-4 text-sm text-destructive">
              Error loading posts. Please try again later.
            </div>
          ) : isLoading ? (
            <div className="p-4 text-sm">Loading posts...</div>
          ) : (
            items.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > posts.length - 1;
              const { post, user } = posts[virtualRow.index] || {};
              return (
                <div
                  data-index={virtualRow.index}
                  key={isLoaderRow ? "loader" : post.id}
                  ref={virtualizer.measureElement}
                  className="border-b border-gray-100"
                >
                  {isLoaderRow ? (
                    <div className="p-4 text-sm">Loading more posts...</div>
                  ) : (
                    <PostItem
                      post={post}
                      user={user}
                      sessionUserId={session?.user?.id}
                      userLikes={userLikes}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
