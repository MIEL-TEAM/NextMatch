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
import { useMemo } from "react";
import useConversationStore from "@/store/conversationStore";
import usePresenceStore from "@/hooks/usePresenceStore";
import { Conversation } from "@/types/chat";
import { createChatId } from "@/lib/util";

type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
  authUserId: string;
};

const SIDEBAR_LIMIT = 5;

export default function MemberSidebar({
  navLinks,
  authUserId,
}: MemberSidebarProps) {
  const pathname = usePathname();

  const orderedIds = useConversationStore((s) => s.orderedIds);
  const conversations = useConversationStore((s) => s.conversations);
  const members = usePresenceStore((s) => s.members);

  const activeUserId = pathname.includes("/chat")
    ? pathname.split("/")[2]
    : null;

  const recentConversations = useMemo((): Conversation[] => {
    if (!authUserId) return [];

    return orderedIds
      .slice(0, SIDEBAR_LIMIT)
      .reduce<Conversation[]>((acc, convId) => {
        const slice = conversations[convId];
        if (!slice?.latestMessage) return acc;

        const msg = slice.latestMessage;
        const isOutgoing = msg.senderId === authUserId;
        const partnerId = isOutgoing ? msg.recipientId : msg.senderId;

        if (!partnerId) return acc;

        const isActive =
          activeUserId === partnerId ||
          convId === createChatId(authUserId, partnerId);

        acc.push({
          userId: partnerId,
          name: isOutgoing
            ? (msg.recipientName ?? partnerId)
            : (msg.senderName ?? partnerId),
          image: isOutgoing ? (msg.recipientImage ?? null) : (msg.senderImage ?? null),
          lastMessage: msg.text ?? "",
          lastMessageDate: new Date(msg.created),
          unreadCount: isActive ? 0 : slice.unreadCount,
          isOnline: members.includes(partnerId),
        });

        return acc;
      }, []);
  }, [orderedIds, conversations, authUserId, activeUserId, members]);

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
          <RecentConversations
            conversations={recentConversations}
            activeUserId={activeUserId}
          />
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
              className={`block rounded-xl py-2.5 px-4 transition-all duration-200 ${pathname === link.href
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