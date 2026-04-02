// src/components/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider basePath={process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` : undefined}>{children}</SessionProvider>;
}
