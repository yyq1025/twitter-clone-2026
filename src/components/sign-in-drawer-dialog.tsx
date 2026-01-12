import { useLocation, useRouter } from "@tanstack/react-router";
import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { authClient } from "@/lib/auth-client";

type SignInDrawerDialogProps = {
  trigger?: ReactElement;
};

export function SignInDrawerDialog({
  trigger,
}: Readonly<SignInDrawerDialogProps>) {
  const router = useRouter();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<"google" | "anonymous" | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading("google");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: location.href,
      });
      setOpen(false);
      await router.invalidate();
    } finally {
      setLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading("anonymous");
    try {
      await authClient.signIn.anonymous();
      setOpen(false);
      await router.invalidate();
    } finally {
      setLoading(null);
    }
  };

  const actionButtons = (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full"
        disabled={loading !== null}
        onClick={handleGoogleSignIn}
      >
        {loading === "google"
          ? "Signing in with Google..."
          : "Sign in with Google"}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        disabled={loading !== null}
        onClick={handleAnonymousSignIn}
      >
        {loading === "anonymous"
          ? "Signing in anonymously..."
          : "Sign in anonymously"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            trigger ?? (
              <Button className="rounded-full font-bold">Sign in</Button>
            )
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in</DialogTitle>
            <DialogDescription>
              Choose a way to continue; you can upgrade or switch accounts at
              any time.
            </DialogDescription>
          </DialogHeader>
          {actionButtons}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger ?? <Button className="rounded-full font-bold">Sign in</Button>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Sign in</DrawerTitle>
          <DrawerDescription>
            Choose a way to continue; you can upgrade or switch accounts at any
            time.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-0">{actionButtons}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
