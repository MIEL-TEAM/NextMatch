"use server";

import { getSession } from "@/lib/session";
import {
  dbGetActiveVibeCounts,
  dbGetUserActiveVibe,
  dbUpsertUserVibe,
  dbDeleteUserVibe,
} from "@/lib/db/vibeActions";
import { VIBES, VIBE_EXPIRY_HOURS } from "@/lib/vibes";

export async function getActiveVibes(): Promise<
  { vibeKey: string; count: number }[]
> {
  const rows = await dbGetActiveVibeCounts();
  return rows.map((r) => ({ vibeKey: r.vibeKey, count: r._count.vibeKey }));
}

export async function getMyActiveVibe(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const vibe = await dbGetUserActiveVibe(session.user.id);
  return vibe?.vibeKey ?? null;
}

export async function setUserVibe(vibeKey: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false };

  const validKey = VIBES.some((v) => v.key === vibeKey);
  if (!validKey) return { ok: false };

  const expiresAt = new Date(
    Date.now() + VIBE_EXPIRY_HOURS * 60 * 60 * 1000
  );

  await dbUpsertUserVibe(session.user.id, vibeKey, expiresAt);
  return { ok: true };
}

export async function clearUserVibe(): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false };
  await dbDeleteUserVibe(session.user.id);
  return { ok: true };
}
