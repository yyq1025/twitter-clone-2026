"use client";

import { authClient } from "@/lib/auth-client";

export default function AuthGuard({
  fallback,
  children,
}: Readonly<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}>) {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending || error || !session) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
