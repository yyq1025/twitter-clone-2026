# Reply dialog proposed props

This captures the prop contract to keep the reply composer consistent with the existing `CreatePostDialog` while surfacing the parent post context for the user.

| Prop | Type | Purpose |
| --- | --- | --- |
| `trigger` | `React.ReactNode` | UI control that opens the dialog, mirroring the `CreatePostDialog` pattern.【F:components/create-post-dialog.tsx†L174-L188】 |
| `post` | `z.infer<typeof selectPostSchema>` | The post being replied to; used for rendering the context header and passing `parentPostId` to the reply action so reply counts increment correctly.【F:components/post-item.tsx†L43-L158】 |
| `postAuthor` | `z.infer<typeof selectUserSchema>` | Author metadata to display alongside the quoted post context (avatar, name, handle).【F:components/post-item.tsx†L43-L158】 |
| `sessionUserId` | `string \| undefined` | Current user id to gate submission/like affordances just like other actions already do.【F:components/post-item.tsx†L56-L151】 |
| `initialContent` | `string` (optional) | Prefills the textarea (e.g., when replying with a pre-composed mention). Matches the controlled textarea model in `CreatePostDialog`.【F:components/create-post-dialog.tsx†L191-L233】 |
| `onOpenChange` | `(open: boolean) => void` (optional) | Lets parents track modal visibility; follow the `Dialog` usage in the post dialog for cleanup/reset hooks.【F:components/create-post-dialog.tsx†L174-L188】 |
| `onSubmitted` | `() => void` (optional) | Fires after a successful reply to refresh feed or close nested UI; similar to how `CreatePostDialog` closes itself on submit.【F:components/create-post-dialog.tsx†L159-L277】 |
| `disableMedia` | `boolean` (optional) | When true, hides media controls if replies should be text-only for a context. Keeps parity with media-management code paths already present.【F:components/create-post-dialog.tsx†L67-L274】 |
| `maxLength` | `number` (optional, default `280`) | Text limit override; defaults to the existing 280-character cap used in the post dialog.【F:components/create-post-dialog.tsx†L195-L202】 |

## Notes
- The modal can reuse the shared media-upload logic from `CreatePostDialog` (validation, previews, cleanup) so the prop surface stays minimal while keeping limits in sync.
- Context rendering can reuse the compact layout pieces from `PostItem` (avatar, name/handle, timestamp, media grid) but with interactions disabled inside the dialog so the focus stays on composing the reply.
