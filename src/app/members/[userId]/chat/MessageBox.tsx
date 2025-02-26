"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import { clsx } from "clsx";
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

  useEffect(() => {
    if (messageEndRef.current)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messageEndRef]);

  const renderAvatar = () => (
    <div className="self-end">
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
    </div>
  );

  const renderMessageHeader = () => (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 w-full text-gray-900">
      <span className="text-sm font-semibold">{message.senderName}</span>
      <span className="text-xs text-gray-500">
        {message.created ? formatShortDateTime(message.created) : "Unknown"}
      </span>
      {message.dateRead && message.recipientId !== currentUserId && (
        <span className="text-xs text-gray-500 italic whitespace-nowrap">
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
        <div className="flex-1 max-w-[85%]">{renderMessageContent()}</div>
      </div>
      <div ref={messageEndRef} />
    </div>
  );
}
