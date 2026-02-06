"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RecentConversations from "@/components/RecentConversations";
import { useEffect, useState, useCallback, useRef } from "react";
import { getRecentConversations } from "@/app/actions/conversationActions";
import { subscribeToPusher, unsubscribeFromPusher } from "@/lib/pusher-client";
import { Channel } from "pusher-js";
import { useSession } from "next-auth/react";
import { Conversation } from "@/types/chat";
import useMessageStore from "@/hooks/useMessageStore";

type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
};

export default function MemberSidebar({
  navLinks,
}: MemberSidebarProps) {      
  const pathname = usePathname();
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<Channel | null>(null);
  const setUnreadCount = useMessageStore((state) => state.setUnreadCount);
  
  const activeUserId = pathname.includes('/chat') 
    ? pathname.split('/')[2] 
    : null;

  const updateGlobalCount = useCallback((convs: Conversation[]) => {
    const totalUnread = convs.reduce((sum, conv) => sum + conv.unreadCount, 0);
    setUnreadCount(totalUnread);
  }, [setUnreadCount]);

  const fetchConversations = useCallback(async () => {
    const result = await getRecentConversations(5);
    if (result.success) {
      let convs = result.conversations as Conversation[];
      
      if (activeUserId) {
        convs = convs.map((conv) =>
          conv.userId === activeUserId ? { ...conv, unreadCount: 0 } : conv
        );
      }
      
      setConversations(convs);
      updateGlobalCount(convs);
    }
    setLoading(false);
  }, [activeUserId, updateGlobalCount]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const privateChannel = subscribeToPusher(`private-${session.user.id}`);
    channelRef.current = privateChannel;

    const handleNewMessage = () => {
      fetchConversations();
    };

    const handleMessagesRead = (data: { readBy?: string }) => {
      if (data?.readBy && data.readBy === activeUserId) {
        return;
      }
      fetchConversations();
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
  }, [session?.user?.id, fetchConversations, activeUserId]);

  return (
    <Card className="
      relative hidden md:flex w-full md:mt-10 md:h-[80vh]
      overflow-hidden shadow-xl
      bg-[#F19A4A]
    ">
      <div className="pointer-events-none absolute inset-0 bg-[#F19A4A]/10" />

      <CardBody className="w-full overflow-y-auto flex-1">
        {/* Recent Conversations Section */}
        <div className="px-4 pt-4">
          {loading ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-white/70 text-sm">טוען...</p>
            </div>
          ) : (
            <RecentConversations 
              conversations={conversations} 
              activeUserId={activeUserId}
            />
          )}
        </div>
      </CardBody>
      
      <CardFooter className="w-full pb-4 px-4 flex flex-col gap-3">
        {/* Divider */}
        <div className="w-full border-t-2 border-white/20 mb-1"></div>

        {/* Navigation Links */}
        <nav className="flex flex-col text-center w-full text-xl gap-3">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.name}
              className={`block rounded-xl py-2.5 px-4 transition-all duration-200 ${
                pathname === link.href
                  ? "bg-white/25 text-white font-bold shadow-md"
                  : "text-white hover:bg-white/15"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Back Button */}
        <Button
          as={Link}
          href="/members"
          fullWidth
          className="bg-white text-[#E37B27] hover:bg-white/50 font-bold shadow-lg mt-2"
        >
          חזרה לדף הקודם
        </Button>
      </CardFooter>
    </Card>
  );
}