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

/**
 * @deprecated Do NOT use for premium gating decisions.
 * JWT isPremium is set at sign-in and is only refreshed on explicit
 * session.update() — it can be stale for up to 24 hours after a
 * subscription change. For any authorization check, query the DB directly:
 *
 *   const user = await prisma.user.findUnique({
 *     where: { id: userId },
 *     select: { isPremium: true, premiumUntil: true },
 *   });
 *   const isActivePremium =
 *     user?.isPremium === true &&
 *     user.premiumUntil !== null &&
 *     user.premiumUntil > new Date();
 *
 * This function is retained for backward compatibility only (currently has
 * no call sites). It may be used for non-critical display hints only.
 *
 * Premium must always be resolved from DB, not JWT (JWT can be stale).
 */
export async function isPremiumUser(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.isPremium ?? false;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}
