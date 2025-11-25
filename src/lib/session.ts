import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function getSession(): Promise<Session | null> {
  try {
    return await auth();
  } catch (error) {
    console.error("[getSession] Auth error:", error);
    return null;
  }
}

export async function getAuthUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getOptionalUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function getUserRole() {
  const session = await getSession();
  return session?.user?.role ?? null;
}

export async function isPremiumUser(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.isPremium ?? false;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}
