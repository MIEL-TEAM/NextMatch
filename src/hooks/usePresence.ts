"use client";

import { useMemo } from "react";
import usePresenceStore from "./usePresenceStore";
import { resolvePresenceStatus, type PresenceResult } from "@/lib/presence";

export function usePresence(
  userId: string,
  lastActiveAt: Date | null | undefined
): PresenceResult {
  const presenceMembers = usePresenceStore((state) => state.members);

  const presence = useMemo(() => {
    const isInPresenceChannel = presenceMembers.includes(userId);
    return resolvePresenceStatus(userId, isInPresenceChannel, lastActiveAt);
  }, [userId, presenceMembers, lastActiveAt]);

  return presence;
}
