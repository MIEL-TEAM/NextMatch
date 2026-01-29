"use client";

import { useMemo } from "react";
import useMessageStore from "@/hooks/useMessageStore";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChatButtonProps } from "@/types/chat";

export default function ChatButton({ initialUnreadCount }: ChatButtonProps) {
  const storeUnreadCount = useMessageStore((state) => state.unreadCount);
  const unreadCount = useMemo(
    () => storeUnreadCount || initialUnreadCount || 0,
    [storeUnreadCount, initialUnreadCount]
  );

  const displayCount = useMemo(
    () => (unreadCount > 99 ? "99+" : unreadCount),
    [unreadCount]
  );

  return (
    <Link
      href="/messages"
      className="relative flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-white/20 sm:hover:bg-white/30 backdrop-blur-md shadow-md border border-white/20 sm:transition-all sm:duration-200 sm:hover:scale-105 sm:active:scale-95"
      aria-label={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <MessageCircle className="w-5 h-5 sm:w-4.5 sm:h-4.5 text-white/90" strokeWidth={2} />
      <AnimatePresence mode="wait">
        {unreadCount > 0 && (
          <motion.div
            key={unreadCount}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full px-1 shadow-lg border border-white/30"
          >
            {displayCount}
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
