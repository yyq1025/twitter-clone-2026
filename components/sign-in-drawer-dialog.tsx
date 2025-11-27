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
    () => trigger ?? <Button className="rounded-full font-bold">登录</Button>,
    [trigger]
  );

  const actionButtons = (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full"
        disabled={loading !== null}
        onClick={handleGithubSignIn}
      >
        {loading === "github" ? "正在使用 GitHub 登录..." : "使用 GitHub 登录"}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        disabled={loading !== null}
        onClick={handleAnonymousSignIn}
      >
        {loading === "anonymous" ? "正在匿名登录..." : "匿名登录"}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
            <DialogDescription>
              选择一种方式进入，稍后随时可以升级或切换账号。
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
          <DrawerTitle>登录</DrawerTitle>
          <DrawerDescription>
            选择一种方式进入，稍后随时可以升级或切换账号。
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-0">{actionButtons}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
