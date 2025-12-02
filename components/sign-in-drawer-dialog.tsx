"use client";

import { useMemo, useState, type ReactNode } from "react";

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
  trigger?: ReactNode;
};

export function SignInDrawerDialog({
  trigger,
}: Readonly<SignInDrawerDialogProps>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [loading, setLoading] = useState<"github" | "anonymous" | null>(null);

  const handleGithubSignIn = async () => {
    setLoading("github");
    try {
      await authClient.signIn.social({ provider: "github" });
    } finally {
      setLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading("anonymous");
    try {
      await authClient.signIn.anonymous();
    } finally {
      setLoading(null);
    }
  };

  const triggerButton = useMemo(
    () =>
      trigger ?? <Button className="rounded-full font-bold">Sign in</Button>,
    [trigger]
  );

  const actionButtons = (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full"
        disabled={loading !== null}
        onClick={handleGithubSignIn}
      >
        {loading === "github"
          ? "Signing in with GitHub..."
          : "Sign in with GitHub"}
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
      <Dialog>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
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
    <Drawer>
      <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
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
