"use client";

import { Avatar } from "@nextui-org/react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import {  RecentConversationsProps } from "@/types/chat";

export default function RecentConversations({
  conversations,
  activeUserId,
}: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
        <MessageCircle className="w-8 h-8 text-white/50 mx-auto mb-2" />
        <p className="text-white text-sm">אין שיחות אחרונות</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-white text-right font-bold text-lg mb-3 px-2">שיחות אחרונות</h3>
      {conversations.map((conversation) => {
        const isActive = activeUserId === conversation.userId;
        return (
          <Link
            key={conversation.userId}
            href={`/members/${conversation.userId}/chat`}
            className="block"
          >
            <div className={`backdrop-blur-sm rounded-xl p-3 transition-all duration-200 group ${
              isActive 
                ? "bg-white/30 ring-2 ring-white/50 shadow-lg" 
                : "bg-white/10 hover:bg-white/20"
            }`}>
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={conversation.image || "/images/user.png"}
                  alt={conversation.name}
                  className="w-16 h-16"
                />
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold text-sm truncate">
                    {conversation.name}
                  </h4>
                  <span className="text-white/60 text-xs flex-shrink-0 mr-2">
                    {formatDistanceToNow(new Date(conversation.lastMessageDate), {
                      addSuffix: true,
                      locale: he,
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    conversation.unreadCount > 0
                        ? "text-white font-medium"
                      : "text-white"
                  }`}
                  dir="rtl"
                >
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          </div>
        </Link>
        );
      })}
    </div>
  );
}
