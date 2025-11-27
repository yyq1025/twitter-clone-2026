"use client";

import { authClient } from "@/lib/auth-client";

export default function AuthGuard({
  fallback = null,
  loader = null,
  children,
}: Readonly<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loader?: React.ReactNode;
}>) {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return <>{loader}</>;
  }

  if (error || !session?.user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
