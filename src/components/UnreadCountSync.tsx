"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import useMessageStore from "@/hooks/useMessageStore";
import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";
import { Channel } from "pusher-js";

type UnreadCountSyncProps = {
  initialUnreadCount: number;
};

export default function UnreadCountSync({ initialUnreadCount }: UnreadCountSyncProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const setUnreadCount = useMessageStore((state) => state.setUnreadCount);
  const updateUnreadCount = useMessageStore((state) => state.updateUnreadCount);
  const channelRef = useRef<Channel | null>(null);
  const initializedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Extract userId from pathname if in a chat
  const activeUserId = pathname?.includes('/chat')
    ? pathname.split('/')[2]
    : null;

  // Check if we're on a member page (where MemberSidebar handles count updates on desktop)
  const isOnMemberPage = pathname?.startsWith('/members/') && pathname.split('/').length >= 3;

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!initializedRef.current && initialUnreadCount !== undefined) {
      setUnreadCount(initialUnreadCount);
      initializedRef.current = true;
    }
  }, [initialUnreadCount, setUnreadCount]);
  useEffect(() => {
    if (!session?.user?.id) return;

    const shouldHandleEvents = isMobile || !isOnMemberPage;
    if (!shouldHandleEvents) return;

    const privateChannel = subscribeToPusher(`private-${session.user.id}`);
    channelRef.current = privateChannel;

    const handleNewMessage = async (data: { senderId?: string }) => {
      // Do not increment unread count if the message was sent by the current user
      if (data?.senderId === session.user.id) return;

      if (!activeUserId || data?.senderId !== activeUserId) {
        updateUnreadCount(1);
      }
    };

    const handleMessagesRead = async (data: { readBy?: string; messageIds?: string[] }) => {
      if (data?.readBy && data?.messageIds?.length) {
        if (data.readBy !== activeUserId) {
          updateUnreadCount(-data.messageIds.length);
        }
      }
    };

    privateChannel.bind("message:new", handleNewMessage);
    privateChannel.bind("messages:read", handleMessagesRead);

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("message:new", handleNewMessage);
        channelRef.current.unbind("messages:read", handleMessagesRead);
        unsubscribeFromPusher(`private-${session.user.id}`);
        channelRef.current = null;
      }
    };
  }, [session?.user?.id, activeUserId, updateUnreadCount, isMobile, isOnMemberPage]);

  return null;
}
