"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

type MessageBoxProps = {
  message: MessageDto;
  currentUserId: string;
};

export default function MessageBox({
  message,
  currentUserId,
}: MessageBoxProps) {
  const isCurrentUserSender = message.senderId === currentUserId;
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (messageEndRef.current)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messageEndRef]);

  const handleAvatarClick = () => {
    router.push(`/members/${message.senderId}`);
  };

  const renderAvatar = () => (
    <div className="self-end cursor-pointer" onClick={handleAvatarClick}>
      <PresenceAvatar
        src={transformImageUrl(message.senderImage) || "/images/user.png"}
        userId={message.senderId}
      />
    </div>
  );

  const messageContentClasses = clsx(
    "flex flex-col w-full px-4 py-3 rounded-lg",
    {
      "bg-blue-100 text-white": isCurrentUserSender,
      "bg-green-100 border border-gray-200": !isCurrentUserSender,
    }
  );

  const renderMessageContent = () => (
    <div className={messageContentClasses}>
      {renderMessageHeader()}
      <p className="text-sm py-2 text-gray-900 break-words">{message.text}</p>
      {/* Move timestamp to bottom on mobile */}
      <div className="text-xs text-gray-500 self-end mt-1 md:hidden">
        {message.created ? formatShortDateTime(message.created) : "Unknown"}
        {message.dateRead && message.recipientId !== currentUserId && (
          <span className="ml-1 italic">
            · Read {timeAgo(message.dateRead)} ago
          </span>
        )}
      </div>
    </div>
  );

  const renderMessageHeader = () => (
    <div className="flex flex-wrap items-center w-full text-gray-900">
      <span className="text-sm font-semibold mr-2">{message.senderName}</span>
      {/* Hide timestamp in header on mobile, show it in desktop */}
      <span className="text-xs text-gray-500 hidden md:inline">
        {message.created ? formatShortDateTime(message.created) : "Unknown"}
      </span>
      {message.dateRead && message.recipientId !== currentUserId && (
        <span className="text-xs text-gray-500 italic ml-2 hidden md:inline">
          (Read {timeAgo(message.dateRead)} ago)
        </span>
      )}
    </div>
  );

  return (
    <div className="grid grid-rows-1">
      <div
        className={clsx("flex gap-3 mb-4", {
          "flex-row-reverse": isCurrentUserSender,
          "flex-row": !isCurrentUserSender,
        })}
      >
        {renderAvatar()}
        <div className="flex-1 max-w-[85%] sm:max-w-[80%]">
          {renderMessageContent()}
        </div>
      </div>
      <div ref={messageEndRef} />
    </div>
  );
}
