"use client";

import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { useCelebrationListener } from "@/hooks/useCelebrationListener";
import { useRevealChannel } from "@/hooks/useRevealChannel";
import { usePrivateChannel } from "@/realtime/usePrivateChannel";
import { useInvitationLoader } from "@/hooks/useInvitationLoader";
import useCelebrationStore from "@/hooks/useCelebrationStore";
import { NextUIProvider } from "@nextui-org/react";
import React, { useEffect, type ReactNode } from "react";
import InterestNotification from "@/hooks/useInterestNotification";
import CelebrationModal, {
  useCelebration,
} from "@/components/CelebrationModal";
import { usePathname } from "next/navigation";
import NotificationLayer from "@/components/notifications/NotificationLayer";

type ProvidersProps = {
  children: ReactNode;
  userId: string | null;
  profileComplete: boolean;
  initialUnreadCount?: number;
  isPremium?: boolean;
  isAdmin?: boolean;
};

export default function Providers({
  children,
  userId,
  profileComplete,
  initialUnreadCount: _initialUnreadCount,
  isAdmin = false,
}: ProvidersProps) {
  const pathname = usePathname();

  const isForbiddenRoute =
    pathname === "/premium" ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";

  const shouldEnableChannels =
    !isForbiddenRoute && !isAdmin && userId && profileComplete;

  usePresenceChannel(shouldEnableChannels ? userId : null, profileComplete);
  useNotificationRealtime(shouldEnableChannels ? userId : null, profileComplete);
  useRevealChannel(shouldEnableChannels ? userId : null, profileComplete);
  usePrivateChannel(userId);

  const { celebration, showCelebration, closeCelebration } = useCelebration();
  useCelebrationListener(
    shouldEnableChannels ? userId : undefined,
    showCelebration
  );

  const setCelebrationOpen = useCelebrationStore((s) => s.setOpen);
  useEffect(() => {
    setCelebrationOpen(celebration.isOpen);
  }, [celebration.isOpen, setCelebrationOpen]);

  useInvitationLoader();

  const isOnMembersPage =
    pathname === "/members" || pathname.startsWith("/members/");
  const shouldShowInterestNotification =
    isOnMembersPage && !isAdmin && userId && profileComplete;

  return (
    <NextUIProvider>
      {shouldShowInterestNotification && userId && (
        <InterestNotification
          userId={userId}
          profileComplete={profileComplete}
        />
      )}

      {!isForbiddenRoute && !isAdmin && <NotificationLayer />}

      {!isForbiddenRoute && !isAdmin && (
        <CelebrationModal
          isOpen={celebration.isOpen}
          onClose={closeCelebration}
          type={celebration.type}
          data={celebration.data}
        />
      )}
      {children}
    </NextUIProvider>
  );
}
