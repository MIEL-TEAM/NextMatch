"use client";

import { useEffect, useRef } from "react";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

interface ProfileViewTrackerProps {
  userId: string;
  children: React.ReactNode;
}

export default function ProfileViewTracker({
  userId,
  children,
}: ProfileViewTrackerProps) {
  const trackInteractions = useInteractionTracking(userId);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (userId && !hasTracked.current) {
      trackInteractions.profileClick();
      hasTracked.current = true;
    }
  }, [userId, trackInteractions]);

  return <>{children}</>;
}
