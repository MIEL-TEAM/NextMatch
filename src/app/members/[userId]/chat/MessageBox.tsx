"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import Image from "next/image";

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

  const isStoryReply =
    message.text.includes("🖼️ הגיב/ה על הסטורי שלך:") &&
    message.text.includes("📸 תמונת הסטורי:");

  const getStoryImageFromMessage = () => {
    if (!isStoryReply) return null;
    const match = message.text.match(/📸 תמונת הסטורי: (.+)/);
    return match ? match[1].trim() : null;
  };

  const getStoryReplyText = () => {
    if (!isStoryReply) return message.text;
    const match = message.text.match(/🖼️ הגיב\/ה על הסטורי שלך: "(.+)"/);
    return match ? match[1] : message.text;
  };

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

      {isStoryReply ? (
        <div className="py-3">
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                {getStoryImageFromMessage() && (
                  <Image
                    src={getStoryImageFromMessage()!}
                    alt="Story"
                    width={48}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">תגובה על סטורי</p>
                <p className="text-sm font-medium text-gray-800">
                  &ldquo;{getStoryReplyText()}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p
          className={clsx("text-sm py-3 text-gray-900", {
            "break-words whitespace-normal": isLongMessage,
          })}
          style={isLongMessage ? { wordBreak: "break-word" } : {}}
        >
          {message.text}
        </p>
      )}
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
