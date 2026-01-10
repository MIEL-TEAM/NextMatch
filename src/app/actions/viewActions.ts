"use server";

import { getSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusher";
import { subMinutes } from "date-fns";
import {
  dbGetProfileViews,
  dbGetRecentProfileView,
  dbMarkProfileViewsAsSeen,
  dbUpsertProfileView,
} from "@/lib/db/viewActions";

export async function recordProfileView(viewerId: string, viewedId: string) {
  if (!viewerId || viewerId === viewedId) return;

  try {
    const recentView = await dbGetRecentProfileView(
      viewerId,
      viewedId,
      subMinutes(new Date(), 1)
    );

    if (recentView) {
      return;
    }

    await dbUpsertProfileView(viewerId, viewedId);

    await pusherServer.trigger(`private-${viewedId}`, "profile-viewed", {
      viewerId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to record profile view:", error);
  }
}

export async function getProfileViews(userId?: string) {
  if (!userId) {
    const session = await getSession();
    userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");
  }

  try {
    const views = await dbGetProfileViews(userId);

    return views.map((view) => ({
      ...view.viewer,
      viewedAt: view.viewedAt,
      seen: view.seen,
    }));
  } catch (error) {
    console.error("Failed to fetch profile views:", error);
    throw new Error("Failed to fetch profile views");
  }
}

export async function markProfileViewsAsSeen(userId: string) {
  if (!userId) throw new Error("User ID is required");

  try {
    await dbMarkProfileViewsAsSeen(userId);

    return { success: true };
  } catch (error) {
    console.error("Failed to mark profile views as seen:", error);
    throw new Error("Failed to mark profile views as seen");
  }
}
