"use server";

import { getAuthUserId } from "@/lib/session";
import { dbCreateBatchedInteractions } from "@/lib/db/smartMatchActions";

export async function trackBatchedViews(targetIds: string[]) {
    const userId = await getAuthUserId();
    if (!userId || targetIds.length === 0) return;

    try {
        await dbCreateBatchedInteractions(userId, targetIds, "view");
        // Note: We intentionally do NOT invalidate SmartMatch cache for views
        // to prevent infinite loops and reduce system load.
    } catch (error) {
        console.error("Failed to track batched views:", error);
        // Fail silently in production to not disrupt UI
    }
}
