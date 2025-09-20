"use client";

import { getUnreadMessageCount } from "@/app/actions/messageActions";
import useMessageStore from "@/hooks/useMessageStore";
import { useNotificationChannel } from "@/hooks/useNotificationChannel";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { useCelebrationListener } from "@/hooks/useCelebrationListener";
import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import React, { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import InterestNotification from "@/hooks/useInterestNotification";
import CelebrationModal, {
  useCelebration,
} from "@/components/CelebrationModal";

type ProvidersProps = {
  children: ReactNode;
  userId: string | null;
  profileComplete: boolean;
};

export default function Providers({
  children,
  userId,
  profileComplete,
}: ProvidersProps) {
  const isUnreadCountSet = useRef(false);

  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);

  const setUnreadCount = useCallback(
    (amount: number) => {
      updateUnreadCount(amount);
    },
    [updateUnreadCount]
  );

  useEffect(() => {
    if (!isUnreadCountSet.current && userId) {
      getUnreadMessageCount().then((count) => {
        setUnreadCount(count);
      });

      isUnreadCountSet.current = true;
    }
  }, [setUnreadCount, userId]);

  usePresenceChannel(userId, profileComplete);
  useNotificationChannel(userId, profileComplete); // נשאיר - רק ההודעות

  const { celebration, showCelebration, closeCelebration } = useCelebration();
  useCelebrationListener(userId || undefined, showCelebration);

  return (
    <SessionProvider>
      <NextUIProvider>
        <Toaster position="top-center" richColors />
        <ToastContainer
          position="bottom-right"
          hideProgressBar
          className="z-50"
        />
        {userId && <InterestNotification userId={userId} />}

        <CelebrationModal
          isOpen={celebration.isOpen}
          onClose={closeCelebration}
          type={celebration.type}
          data={celebration.data}
        />

        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}
