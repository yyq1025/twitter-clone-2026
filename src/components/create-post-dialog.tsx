import { useUploadFiles } from "@better-upload/client";
import { autoUpdate, useFloating } from "@floating-ui/react-dom";
import { IconPhoto, IconX } from "@tabler/icons-react";
import Mention from "@tiptap/extension-mention";
import { Placeholder } from "@tiptap/extensions";
import {
  EditorContent,
  ReactRenderer,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { SuggestionProps } from "@tiptap/suggestion";
import dayjs from "dayjs";
import type { ReactElement, Ref } from "react";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { v7 as uuidv7 } from "uuid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useControllableState } from "@/hooks/use-controllable-state";
import { usePostMedia } from "@/hooks/use-post-media";
import { createPost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";
import type { SelectPost, SelectUser } from "@/lib/validators";
import { detectFacets } from "@/utils/post";

type MentionListHandle = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

type MentionUser = {
  id: string;
  label: string;
  name: string;
  avatar: string;
};

const mockMentionUsers: MentionUser[] = [
  {
    id: "alice",
    label: "alice",
    name: "Alice Chen",
    avatar: "https://i.pravatar.cc/80?u=alice",
  },
  {
    id: "bob",
    label: "bob",
    name: "Bob Nguyen",
    avatar: "https://i.pravatar.cc/80?u=bob",
  },
  {
    id: "charlie",
    label: "charlie",
    name: "Charlie Patel",
    avatar: "https://i.pravatar.cc/80?u=charlie",
  },
];

const MentionList = (
  props: SuggestionProps & { ref: Ref<MentionListHandle> },
) => {
  // const [open, setOpen] = useState(true);
  const [highLightedIndex, setHighlightedIndex] = useState(0);
  const items = (props.items as MentionUser[]) ?? [];
  const anchor = useMemo(() => {
    const rect = props.clientRect?.();
    if (!rect) return null;

    return {
      getBoundingClientRect: () => rect,
    };
  }, [props.clientRect]);

  useEffect(() => {
    if (highLightedIndex < 0) {
      setHighlightedIndex(0);
      return;
    }

    if (highLightedIndex >= items.length) {
      setHighlightedIndex(Math.max(items.length - 1, 0));
    }
  }, [highLightedIndex, items.length]);

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "bottom-start",
    elements: {
      reference: anchor,
    },
    whileElementsMounted: autoUpdate,
  });

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setHighlightedIndex((index) => Math.max(index - 1, 0));
        return true;
      }

      if (event.key === "ArrowDown") {
        setHighlightedIndex((index) => Math.min(index + 1, items.length - 1));
        return true;
      }

      if (event.key === "Enter") {
        const item = items[highLightedIndex];
        if (item) {
          props.command(item);
        }
        return true;
      }

      return false;
    },
  }));

  if (!anchor) return null;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 min-w-60 rounded border bg-popover p-2 text-popover-foreground shadow-lg"
    >
      <div className="flex flex-col gap-1">
        {items.length === 0 ? (
          <div className="px-2 py-1 text-muted-foreground text-sm">
            No results
          </div>
        ) : (
          items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-2 rounded px-2 py-1 text-left text-sm transition ${
                index === highLightedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/60"
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => props.command(item)}
            >
              <Avatar size="sm">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback>{item.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium">{item.name}</div>
                <div className="truncate text-muted-foreground text-xs">
                  @{item.label}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

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
  const { data: session } = authClient.useSession();
  const { uploadAsync } = useUploadFiles({ route: "images" });
  const mentionListRef = useRef<MentionListHandle | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Placeholder.configure({
        placeholder: parentPost ? "Post your reply" : "What's happening?",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          char: "@",
          items: ({ query }) => {
            const normalizedQuery = query.trim().toLowerCase();
            if (!normalizedQuery) return mockMentionUsers;

            return mockMentionUsers.filter((user) => {
              return (
                user.label.toLowerCase().includes(normalizedQuery) ||
                user.name.toLowerCase().includes(normalizedQuery)
              );
            });
          },
          render: () => {
            let reactRenderer: ReactRenderer | null = null;

            return {
              onStart: (props) => {
                reactRenderer = new ReactRenderer(MentionList, {
                  props: { ...props, ref: mentionListRef },
                  editor: props.editor,
                });
                if (reactRenderer.element) {
                  document.body.append(reactRenderer.element);
                }
              },
              onUpdate: (props) => {
                reactRenderer?.updateProps(props);
              },
              onKeyDown: (props) => {
                if (props.event.key === "Escape") {
                  props?.event.preventDefault();
                  props?.event.stopPropagation();
                  reactRenderer?.destroy();
                  return true;
                }

                return mentionListRef.current?.onKeyDown(props) || false;
              },
              onExit: () => {
                reactRenderer?.element?.remove();
                reactRenderer?.destroy();
                reactRenderer = null;
              },
            };
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "text-base leading-tight min-h-24 focus:outline-none pre-wrap",
      },
    },
  });
  const editorText = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return editor.getText();
    },
  });
  const [dialogOpen, setDialogOpen] = useControllableState({
    value: open,
    defaultValue: false,
    onChange: onOpenChange,
  });
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
    if (!editorText?.trim()) return;

    try {
      setSubmitting(true);
      let postMedia: { key: string; type: string; name: string }[] = [];

      if (mediaFiles.length > 0) {
        const renamedFiles = mediaFiles.map(
          ({ file }, index) =>
            new File([file], `${index}-${file.name}`, {
              type: file.type,
              lastModified: file.lastModified,
            }),
        );

        const { files, failedFiles } = await uploadAsync(renamedFiles);

        if (failedFiles.length > 0) {
          console.error("Some files failed to upload:", failedFiles);
          return;
        }

        postMedia = files.map((file) => ({
          key: file.objectInfo.key,
          type: file.type,
          name: file.name,
        }));
      }

      createPost({
        payload: {
          id: uuidv7(),
          creator_id: session.user.id,
          content: editorText.trim(),
          reply_root_id: parentPost?.reply_root_id || parentPost?.id,
          reply_parent_id: parentPost?.id,
          media: postMedia,
          media_length: postMedia.length,
        },
        userId: session.user.id,
      });
      editor?.commands.clearContent();
      cleanupMedia();
      setDialogOpen(false);
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

  if (!session?.user) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className="max-h-[90vh] gap-0 overflow-auto p-0 sm:max-w-xl"
        showCloseButton={false}
        onClick={(e) => e.stopPropagation()}
        data-testid="create-post-dialog"
      >
        <DialogHeader className="flex h-14 flex-row items-center gap-0 px-4">
          <div className="flex min-w-14 items-center">
            <DialogClose
              render={
                <Button
                  type="reset"
                  size="icon"
                  variant="ghost"
                  className="-m-2 rounded-full"
                >
                  <IconX className="size-5" />
                </Button>
              }
            />
          </div>
          <div className="flex-1" />
          <Button
            disabled={!editorText?.trim() || submitting}
            onClick={onSubmit}
          >
            {parentPost ? "Reply" : "Post"}
          </Button>
          <DialogTitle className="sr-only">
            {parentPost ? "Reply" : "Create Post"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-4 px-4 py-1">
          <div className="flex-1">
            {parentPost && parentUser && (
              <div className="mb-2 flex gap-2">
                <div className="flex flex-col">
                  <Avatar size="lg">
                    <AvatarImage
                      src={parentUser.image || undefined}
                      alt={parentUser.name}
                    />
                    <AvatarFallback>
                      {parentUser.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-1 flex-1">
                    <div className="mx-auto h-full w-0.5 bg-border" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pb-6 text-base">
                  <p className="flex items-center gap-1 pb-1 text-muted-foreground leading-tight">
                    <span className="font-bold text-foreground">
                      {parentUser.name}
                    </span>
                    <span>@{parentUser.username}</span>
                    <span>·</span>
                    <span>{dayjs(parentPost.created_at).format("MMM D")}</span>
                  </p>
                  <p className="wrap-break-word whitespace-pre-wrap leading-tight">
                    {parentPost.content}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Avatar size="lg">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || "User"}
                />
                <AvatarFallback>
                  {session?.user?.name
                    ? session.user.name[0].toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div data-testid="editor" className="flex-1 space-y-2">
                <EditorContent editor={editor} />
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
          <div className="flex items-center">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
