"use server";

import { getAuthUserId } from "@/lib/session";
import { pusherServer } from "@/lib/pusher";
import {
  dbGetMutualMatchIds,
  dbGetOutboundLikes,
  dbGetUserForAnnouncement,
  dbUpdateUserAnnouncementTime,
} from "@/lib/db/presenceActions";

export async function announceUserOnline(): Promise<{ success: boolean }> {
  try {
    const userId = await getAuthUserId();
    console.log("🔔 [announceUserOnline] Called for userId:", userId);

    if (!userId) {
      console.log("🔔 [announceUserOnline] No userId, aborting");
      return { success: false };
    }

    // Fetch user with ANNOUNCEMENT timestamp (not activity timestamp)
    const user = await dbGetUserForAnnouncement(userId);

    if (!user) {
      console.log("🔔 [announceUserOnline] User not found");
      return { success: false };
    }

    // Cooldown logic (announcement-level, not presence-level)
    const now = Date.now();
    const lastAnnounced = user.lastOnlineAnnouncedAt
      ? user.lastOnlineAnnouncedAt.getTime()
      : 0;

    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    if (now - lastAnnounced < COOLDOWN_MS) {
      const seconds = Math.floor((now - lastAnnounced) / 1000);
      console.log(
        `🔔 [announceUserOnline] ⛔ Cooldown active (${seconds}s ago, need 300s)`
      );
      return { success: false };
    }

    console.log(
      "🔔 [announceUserOnline] Cooldown passed, proceeding with announcement"
    );

    // Step 1: Users this user liked
    const likedUsers = await dbGetOutboundLikes(userId);

    const likeIds = likedUsers.map((x) => x.targetUserId);

    if (likeIds.length === 0) {
      console.log(
        "🔔 [announceUserOnline] No outgoing likes → no mutual matches"
      );

      // Still update announcement time to prevent repeat work
      await dbUpdateUserAnnouncementTime(userId);

      return { success: true };
    }

    // Step 2: Mutual matches (same logic as fetchMutualLikes)
    const mutualMatches = await dbGetMutualMatchIds(userId, likeIds);

    if (mutualMatches.length === 0) {
      console.log("🔔 [announceUserOnline] No mutual matches found");

      await dbUpdateUserAnnouncementTime(userId);

      return { success: true };
    }

    console.log(
      `🔔 [announceUserOnline] Notifying ${mutualMatches.length} mutual matches`,
      mutualMatches.map((m) => m.sourceUserId)
    );

    const payload = {
      userId,
      name: user.name || "משתמש",
      image: user.image,
      timestamp: new Date().toISOString(),
    };

    // Fire notifications (best-effort, parallel)
    await Promise.all(
      mutualMatches.map((match) =>
        pusherServer
          .trigger(`private-${match.sourceUserId}`, "match:online", payload)
          .then(() =>
            console.log(
              `🔔 [announceUserOnline] ✅ Sent to ${match.sourceUserId}`
            )
          )
          .catch((err) =>
            console.error(
              `🔔 [announceUserOnline] ❌ Failed to notify ${match.sourceUserId}`,
              err
            )
          )
      )
    );

    // Mark announcement time (THIS is the cooldown source)
    await dbUpdateUserAnnouncementTime(userId);

    console.log("🔔 [announceUserOnline] ✅ Completed successfully");
    return { success: true };
  } catch (error) {
    console.error("🔔 [announceUserOnline] ❌ ERROR:", error);
    return { success: false };
  }
}
