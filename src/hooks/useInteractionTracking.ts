"use client";

import { useEffect, useRef } from "react";
import { trackUserInteraction } from "@/app/actions/smartMatchActions";

// Silent error handler for production
const handleError = (error: any) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error tracking interaction:", error);
  }
};

export function useInteractionTracking(targetUserId: string) {
  const viewStartTime = useRef<number | null>(null);
  const interactionSent = useRef<boolean>(false);
  const profileClickSent = useRef<boolean>(false);

  useEffect(() => {
    if (!targetUserId || interactionSent.current) return;

    viewStartTime.current = Date.now();

    trackUserInteraction(targetUserId, "view").catch(handleError);
    interactionSent.current = true;

    return () => {
      if (viewStartTime.current) {
        const duration = Math.floor(
          (Date.now() - viewStartTime.current) / 1000
        );
        if (duration > 5) {
          trackUserInteraction(targetUserId, "view").catch(
            handleError
          );
        }
      }
    };
  }, [targetUserId]);

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
