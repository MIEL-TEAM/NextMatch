"use client";

import {
  SessionProvider as NextAuthSessionProvider,
  useSession as useNextAuthSession,
} from "next-auth/react";

export const SessionProvider = NextAuthSessionProvider;

export function useServerSession() {
  const sessionResult = useNextAuthSession();

  return {
    session: sessionResult.data ?? null,
    status: sessionResult.status,
    user: sessionResult.data?.user ?? null,
  };
}

export function useUser() {
  const { user } = useServerSession();
  return user;
}
