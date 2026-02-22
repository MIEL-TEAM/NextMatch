"use client";

import { getUnreadMessageCount } from "@/app/actions/messageActions";
import useMessageStore from "@/hooks/useMessageStore";
import { useNotificationChannel } from "@/hooks/useNotificationChannel";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { useCelebrationListener } from "@/hooks/useCelebrationListener";
import { useRevealChannel } from "@/hooks/useRevealChannel";
import { useInvitationLoader } from "@/hooks/useInvitationLoader";
import useCelebrationStore from "@/hooks/useCelebrationStore";
import { NextUIProvider } from "@nextui-org/react";
import React, { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import InterestNotification from "@/hooks/useInterestNotification";
import CelebrationModal, {
  useCelebration,
} from "@/components/CelebrationModal";
import { usePathname } from "next/navigation";

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
  initialUnreadCount,
  isAdmin = false,
}: ProvidersProps) {
  const pathname = usePathname();
  const isUnreadCountSet = useRef(false);

  const isForbiddenRoute =
    pathname === "/premium" ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";

  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const setStoreUnreadCount = useMessageStore((state) => state.setUnreadCount);

  const setUnreadCount = useCallback(
    (amount: number) => {
      updateUnreadCount(amount);
    },
    [updateUnreadCount]
  );

  useEffect(() => {
    const skipLogic =
      isForbiddenRoute ||
      isAdmin ||
      initialUnreadCount === undefined ||
      isUnreadCountSet.current;

    if (skipLogic) return;

    setStoreUnreadCount(initialUnreadCount);
    isUnreadCountSet.current = true;
  }, [initialUnreadCount, setStoreUnreadCount, isAdmin, isForbiddenRoute]);

  useEffect(() => {
    const skipLogic =
      isForbiddenRoute || isAdmin || !userId || isUnreadCountSet.current;

    if (skipLogic) return;

    getUnreadMessageCount()
      .then((count) => {
        setUnreadCount(count);
        isUnreadCountSet.current = true;
      })
      .catch(() => {
        isUnreadCountSet.current = true;
      });
  }, [setUnreadCount, userId, isAdmin, isForbiddenRoute]);

  const shouldEnableChannels =
    !isForbiddenRoute && !isAdmin && userId && profileComplete;

  usePresenceChannel(shouldEnableChannels ? userId : null, profileComplete);
  useNotificationChannel(shouldEnableChannels ? userId : null, profileComplete);
  useRevealChannel(shouldEnableChannels ? userId : null, profileComplete);

  const { celebration, showCelebration, closeCelebration } = useCelebration();
  useCelebrationListener(
    shouldEnableChannels ? userId : undefined,
    showCelebration
  );

  const setCelebrationOpen = useCelebrationStore((s) => s.setOpen);
  useEffect(() => {
    setCelebrationOpen(celebration.isOpen);
  }, [celebration.isOpen, setCelebrationOpen]);

  // Load pending invitations from backend on app startup
  useInvitationLoader();

  // Interest notification: only eligible on /members routes
  const isOnMembersPage =
    pathname === "/members" || pathname.startsWith("/members/");
  const shouldShowInterestNotification =
    isOnMembersPage && !isAdmin && userId && profileComplete;

  console.log({
    pathname,
    isOnMembersPage,
    userId,
    profileComplete,
    shouldShowInterestNotification,
  });

  return (
    <NextUIProvider>
      <Toaster
        position="top-center"
        richColors
        expand={false}
        visibleToasts={3}
        toastOptions={{
          className: 'sm:max-w-md',
          style: {
            maxWidth: '400px',
            width: 'calc(100vw - 32px)',
            margin: '0 auto',
            zIndex: 100001,
          },
        }}
      />
      <ToastContainer
        position="top-right"
        hideProgressBar
        className="!top-[80px] sm:!top-6 !right-4 !left-4 sm:!left-auto !z-[100001]"
        toastClassName="!mb-3 !rounded-2xl sm:!rounded-xl !shadow-xl"
        bodyClassName="!p-0"
        limit={3}
        newestOnTop
        closeButton={false}
        autoClose={5000}
      />

      {shouldShowInterestNotification && userId && (
        <InterestNotification
          userId={userId}
          profileComplete={profileComplete}
        />
      )}

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
