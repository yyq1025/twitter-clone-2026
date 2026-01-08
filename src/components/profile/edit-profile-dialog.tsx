import { IconX } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  bio: z.string().max(160, "Bio is too long"),
});

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { data: session } = authClient.useSession();
  const form = useForm({
    defaultValues: {
      name: session?.user?.name || "",
      bio: session?.user?.bio || "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Submitting", value);
      await authClient.updateUser({
        name: value.name,
        bio: value.bio,
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <form
          className="max-h-[90vh] overflow-auto"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader className="sticky top-0 z-20 flex h-14 flex-row items-center gap-0 border-b bg-white/85 px-4 backdrop-blur-md">
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
            <DialogTitle className="flex-1 font-semibold text-lg">
              Edit Profile
            </DialogTitle>
            <form.Subscribe
              selector={(state) => [
                state.isDefaultValue,
                state.canSubmit,
                state.isSubmitting,
              ]}
            >
              {([isDefaultValue, canSubmit, isSubmitting]) => (
                <Button
                  size="sm"
                  type="submit"
                  disabled={isDefaultValue || !canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </DialogHeader>
          <div className="aspect-3/1 w-full bg-muted" />
          <div className="-mt-12 ml-4 aspect-square w-1/4 max-w-30 rounded-full border-4 border-white">
            <Avatar className="size-full">
              <AvatarImage
                src={session?.user?.image || undefined}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback>
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <FieldGroup className="gap-5 px-4 py-6 pt-3 *:gap-2">
            <form.Field name="name">
              {(field) => (
                <Field data-invalid={!field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!field.state.meta.isValid}
                  />
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>
            <form.Field name="bio">
              {(field) => (
                <Field data-invalid={!field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!field.state.meta.isValid}
                    rows={4}
                    className="field-sizing-fixed"
                  />
                  {!field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
