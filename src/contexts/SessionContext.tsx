"use client";

import {
  SessionProvider as NextAuthSessionProvider,
  useSession as useNextAuthSession,
} from "next-auth/react";

// Export the real SessionProvider from NextAuth
export const SessionProvider = NextAuthSessionProvider;

export function useServerSession() {
  const { data: session, status } = useNextAuthSession();

  return {
    session: session ?? null,
    status:
      status === "loading"
        ? "loading"
        : status === "authenticated"
          ? "authenticated"
          : "unauthenticated",
    user: session?.user ?? null,
  };
}

export function useUser() {
  const { user } = useServerSession();
  return user;
}
