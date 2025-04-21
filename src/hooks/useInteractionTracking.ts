"use client";

import { useEffect, useRef } from "react";
import { trackUserInteraction } from "@/app/actions/smartMatchActions";

export function useInteractionTracking(targetUserId: string) {
  const viewStartTime = useRef<number | null>(null);
  const interactionSent = useRef<boolean>(false);
  const profileClickSent = useRef<boolean>(false);

  useEffect(() => {
    if (!targetUserId || interactionSent.current) return;

    viewStartTime.current = Date.now();

    trackUserInteraction(targetUserId, "view").catch(console.error);
    interactionSent.current = true;

    return () => {
      if (viewStartTime.current) {
        const duration = Math.floor(
          (Date.now() - viewStartTime.current) / 1000
        );
        if (duration > 5) {
          trackUserInteraction(targetUserId, "view", duration).catch(
            console.error
          );
        }
      }
    };
  }, [targetUserId]);

  const trackInteractions = {
    like: () => trackUserInteraction(targetUserId, "like"),
    message: () => trackUserInteraction(targetUserId, "message"),
    profileClick: () => {
      if (!profileClickSent.current) {
        return trackUserInteraction(targetUserId, "profile_click");
      }
      return Promise.resolve(null);
    },
  };

  return trackInteractions;
}
