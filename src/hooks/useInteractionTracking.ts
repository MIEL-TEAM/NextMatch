"use client";

import { useRef } from "react";
import { trackUserInteraction } from "@/app/actions/smartMatchActions";

// Silent error handler for production
const handleError = (error: any) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error tracking interaction:", error);
  }
};



export function useInteractionTracking(targetUserId: string) {
  const profileClickSent = useRef<boolean>(false);

  // Note: View tracking is now handled by useVisibilityTracking and InteractionBatcher
  // to prevent request storms and ensure visibility-based tracking.

  const trackInteractions = {
    like: () => trackUserInteraction(targetUserId, "like").catch(handleError),
    message: () =>
      trackUserInteraction(targetUserId, "message").catch(handleError),
    profileClick: () => {
      if (!profileClickSent.current) {
        profileClickSent.current = true;
        return trackUserInteraction(targetUserId, "profile_click").catch(
          handleError
        );
      }
      return Promise.resolve(null);
    },
  };

  return trackInteractions;
}
