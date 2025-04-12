"use client";

import { getUnreadMessageCount } from "@/app/actions/messageActions";
import useMessageStore from "@/hooks/useMessageStore";
import { useNotificationChannel } from "@/hooks/useNotificationChannel";
import { usePresenceChannel } from "@/hooks/usePresenceChannel";
import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import React, { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import InterestNotification from "@/hooks/useInterestNotification";

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
  useNotificationChannel(userId, profileComplete);

  return (
    <SessionProvider>
      <NextUIProvider>
        {/* This is essential for sonner toasts to appear */}
        <Toaster position="top-center" richColors />
        <ToastContainer
          position="bottom-right"
          hideProgressBar
          className="z-50"
        />
        {/* Notice we're using the component now, not the hook */}
        {userId && <InterestNotification userId={userId} />}
        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}
