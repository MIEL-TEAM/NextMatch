"use client";

import useMessageStore from "@/hooks/useMessageStore";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@nextui-org/react";

type ChatButtonProps = {
  initialUnreadCount: number;
};

export default function ChatButton({ initialUnreadCount }: ChatButtonProps) {
  const storeUnreadCount = useMessageStore((state) => state.unreadCount);
  const unreadCount = storeUnreadCount || initialUnreadCount || 0;

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur shadow-md border border-white/20 transition-all hover:scale-105"
    >
      <Badge
        content={unreadCount > 0 ? unreadCount : null}
        color="danger"
        shape="circle"
        isInvisible={unreadCount === 0}
        size="sm"
        className="border-none"
      >
        <MessageCircle className="w-5 h-5 text-white/90" />
      </Badge>
    </Link>
  );
}
