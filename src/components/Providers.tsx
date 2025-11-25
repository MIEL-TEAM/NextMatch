"use client";

import { getUnreadMessageCount } from "@/app/actions/messageActions";
import useMessageStore from "@/hooks/useMessageStore";
import { useNotificationChannel } from "@/hooks/useNotificationChannel";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { useCelebrationListener } from "@/hooks/useCelebrationListener";
import { NextUIProvider } from "@nextui-org/react";
import React, { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import InterestNotification from "@/hooks/useInterestNotification";
import CelebrationModal, {
  useCelebration,
} from "@/components/CelebrationModal";
import { AIAssistantButton } from "@/components/ai-assistant";
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
  isPremium = false,
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

  const { celebration, showCelebration, closeCelebration } = useCelebration();
  useCelebrationListener(
    shouldEnableChannels ? userId : undefined,
    showCelebration
  );

  return (
    <NextUIProvider>
      <Toaster position="top-center" richColors />
      <ToastContainer
        position="bottom-right"
        hideProgressBar
        className="z-50"
      />

      {!isForbiddenRoute && !isAdmin && userId && (
        <InterestNotification userId={userId} />
      )}

      {!isForbiddenRoute && !isAdmin && (
        <CelebrationModal
          isOpen={celebration.isOpen}
          onClose={closeCelebration}
          type={celebration.type}
          data={celebration.data}
        />
      )}

      {!isForbiddenRoute && !isAdmin && userId && profileComplete && (
        <AIAssistantButton userId={userId} isPremium={isPremium} />
      )}

      {children}
    </NextUIProvider>
  );
}
