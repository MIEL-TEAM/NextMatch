"use server";

import { getAuthUserId } from "@/lib/session";
import {
  getSmartMatchesOrchestrator,
  trackInteraction,
} from "@/lib/smart-matching/orchestrator";

export async function getSmartMatches() {
  const userId = await getAuthUserId();
  if (!userId) return { items: [], totalCount: 0 };

  return getSmartMatchesOrchestrator(userId);
}

export async function trackUserInteraction(
  targetUserId: string,
  action: string,
) {
  const userId = await getAuthUserId();
  if (!userId) return null;
  return trackInteraction(userId, targetUserId, action);
}

import {
  getUserLikes as _getUserLikes,
  getUserMessages as _getUserMessages,
  getUserInteractions as _getUserInteractions,
} from "./ai/smartProfile";

export async function getUserLikes(userId: string) {
  return _getUserLikes(userId);
}

export async function getUserMessages(userId: string) {
  return _getUserMessages(userId);
}

export async function getUserInteractions(userId: string) {
  return _getUserInteractions(userId);
}
