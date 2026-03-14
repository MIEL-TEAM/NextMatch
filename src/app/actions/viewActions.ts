"use server";

import { getSession } from "@/lib/session";
import { pusherServer } from "@/lib/pusher-server";
import { subMinutes } from "date-fns";
import {
  dbGetProfileViews,
  dbGetRecentProfileView,
  dbMarkProfileViewsAsSeen,
  dbUpsertProfileView,
} from "@/lib/db/viewActions";
import { dbGetMemberNameImage, dbGetUserPremiumStatus } from "@/lib/db/likeActions";
import {
  notifyProfileView,
  notifyProfileViewTeaser,
} from "@/lib/notifications/notificationService";
import { isActivePremium } from "@/lib/premiumUtils";

export async function recordProfileView(viewerId: string, viewedId: string) {
  if (!viewerId || viewerId === viewedId) return;

  try {
    const recentView = await dbGetRecentProfileView(
      viewerId,
      viewedId,
      subMinutes(new Date(), 1),
    );

    if (recentView) {
      return;
    }

    await dbUpsertProfileView(viewerId, viewedId);

    await pusherServer.trigger(`private-${viewedId}`, "profile-viewed", {
      viewerId,
      timestamp: new Date().toISOString(),
    });

    const viewedUser = await dbGetUserPremiumStatus(viewedId).catch(() => null);
    const viewedIsPremium = isActivePremium(viewedUser);

    if (viewedIsPremium) {
      const viewerInfo = await dbGetMemberNameImage(viewerId).catch(() => null);
      if (viewerInfo) {
        await notifyProfileView(
          viewedId,
          viewerId,
          viewerInfo.name || "משתמש",
          viewerInfo.image || null,
          viewerInfo.gender ?? null,
        ).catch((e) =>
          console.error("Failed to create profile view notification:", e),
        );
      }
    } else {
      await notifyProfileViewTeaser(viewedId).catch((e) =>
        console.error("Failed to create profile view teaser notification:", e),
      );
    }
  } catch (error) {
    console.error("Failed to record profile view:", error);
  }
}

export async function getProfileViews(userId?: string): Promise<
  | { restricted: true; views: [] }
  | {
      restricted: false;
      views: Array<{
        id: string;
        name: string | null;
        image: string | null;
        viewedAt: Date;
        seen: boolean;
      }>;
    }
> {
  if (!userId) {
    const session = await getSession();
    userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");
  }

  const user = await dbGetUserPremiumStatus(userId).catch(() => null);
  if (!isActivePremium(user)) {
    return { restricted: true, views: [] };
  }

  try {
    const views = await dbGetProfileViews(userId);

    return {
      restricted: false,
      views: views.map((view) => ({
        id: view.viewer.id,
        name: view.viewer.name,
        image: view.viewer.image,
        viewedAt: view.viewedAt,
        seen: view.seen,
      })),
    };
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
