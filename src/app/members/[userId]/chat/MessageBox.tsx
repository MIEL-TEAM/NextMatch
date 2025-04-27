"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";

import clsx from "clsx";
import React, { useEffect, useRef, memo } from "react";
import { useRouter } from "next/navigation";

type MessageBoxProps = {
  message: MessageDto;
  currentUserId: string;
};

function MessageBox({ message, currentUserId }: MessageBoxProps) {
  const isCurrentUserSender = message.senderId === currentUserId;
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isLongMessage = message.text.length > 50;

  useEffect(() => {
    if (messageEndRef.current)
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messageEndRef]);

  const renderAvatar = () => (
    <div
      className="self-end cursor-pointer transition-all duration-300 hover:scale-105 hover:opacity-hover relative group"
      onClick={() => router.push(`/members/${message.senderId}`)}
      role="button"
      aria-label={`View ${message.senderName}'s profile`}
    >
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
    <div
      className={messageContentClasses}
      style={isLongMessage ? { maxWidth: "450px" } : {}}
    >
      {renderMessageHeader()}
      <p
        className={clsx("text-sm py-3 text-gray-900", {
          "break-words whitespace-normal": isLongMessage,
        })}
        style={isLongMessage ? { wordBreak: "break-word" } : {}}
      >
        {message.text}
      </p>
    </div>
  );

  const renderMessageHeader = () => (
    <div
      className={clsx("flex items-center w-full text-gray-900", {
        "justify-between": isCurrentUserSender,
      })}
    >
      {message.dateRead && message.recipientId !== currentUserId ? (
        <span className="text-xs text-black text-italic">
          (נקרא {timeAgo(message.dateRead)})
        </span>
      ) : (
        <div></div>
      )}

      <div className="flex">
        <span className="text-sm font-semibold text-gray-900">
          {message.senderName}
        </span>
        <span className="text-sm text-gray-500 ml-2 mr-1 whitespace-nowrap">
          {formatShortDateTime(message.created)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-rows-1">
      <div
        className={clsx("flex gap-3 mb-4", {
          "justify-end text-right": isCurrentUserSender,
          "justify-start": !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}
        <div
          className={clsx("flex-1", {
            "max-w-[85%] sm:max-w-[80%]": !isLongMessage,
          })}
        >
          {renderMessageContent()}
        </div>
        {isCurrentUserSender && renderAvatar()}
      </div>

      <div ref={messageEndRef} />
    </div>
  );
}

export default memo(MessageBox);
