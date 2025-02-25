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

  const messageContentClasses = clsx("flex flex-col w-[100%] px-2 py-1", {
    "rounded-l-xl rounded-tr-xl text-white bg-blue-100": isCurrentUserSender,
    "rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100":
      !isCurrentUserSender,
  });

  const renderMessageContent = () => (
    <div className={messageContentClasses}>
      {renderMessageHeader()}
      <p className="text-sm py-3 text-gray-900 break-words whitespace-pre-wrap">
        {message.text}
      </p>
    </div>
  );

  const renderMessageHeader = () => (
    <div
      className={clsx("flex items-center w-full", {
        "justify-between": isCurrentUserSender,
      })}
    >
      {message.dateRead && message.recipientId !== currentUserId ? (
        <span className="text-xs text-black text-italic">
          (נקרא לפני {timeAgo(message.dateRead)})
        </span>
      ) : (
        <div></div>
      )}

      <div className="flex">
        <span className="text-sm font-semibold text-gray-900">
          {message.senderName}
        </span>
        <span className="text-sm text-gray-500 ml-2 mr-1">
          {message.created ? formatShortDateTime(message.created) : "לא ידוע"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-rows-1">
      <div
        className={clsx("flex gap-2 mb-3", {
          "justify-end text-right": isCurrentUserSender,
          "justify-start": !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}
        <div className="w-full md:w-auto max-w-[80%]">
          {renderMessageContent()}
        </div>
        {isCurrentUserSender && renderAvatar()}
      </div>

      <div ref={messageEndRef} />
    </div>
  );
}
