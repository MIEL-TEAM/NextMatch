"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageDto } from "@/types";
import Image from "next/image";

import clsx from "clsx";
import React, { useEffect, useRef, memo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit2, Trash2, Check, X } from "lucide-react";
import { deleteMessage, editMessage } from "@/app/actions/messageActions";
import { toast } from "react-hot-toast";

type MessageBoxProps = {
  message: MessageDto;
  currentUserId: string;
};

function MessageBox({ message, currentUserId }: MessageBoxProps) {
  const isCurrentUserSender = message.senderId === currentUserId;
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    if (!message.recipientId) return;

    setIsDeleting(true);
    try {
      const result = await deleteMessage(message.id, message.recipientId);
      if (result.status === "success") {
        toast.success("ההודעה נמחקה בהצלחה");
      } else {
        toast.error(result.error as string);
      }
    } catch {
      toast.error("אירעה שגיאה במחיקת ההודעה");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!message.recipientId || editedText.trim() === "") return;
    if (editedText === message.text) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await editMessage(
        message.id,
        editedText,
        message.recipientId
      );
      if (result.status === "success") {
        toast.success("ההודעה עודכנה בהצלחה");
        setIsEditing(false);
      } else {
        toast.error(result.error as string);
      }
    } catch {
      toast.error("אירעה שגיאה בעדכון ההודעה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedText(message.text);
    setIsEditing(false);
  };

  const renderAvatar = () => (
    <div
      className="self-end cursor-pointer transition-all duration-300 hover:scale-105 hover:opacity-90 relative group flex-shrink-0"
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

  const messageContentClasses = clsx("flex flex-col", {
    "px-2 py-1": !isStoryReply,
    "w-full": !isStoryReply,
    "rounded-l-xl rounded-tr-xl text-white bg-blue-100":
      isCurrentUserSender && !isStoryReply,
    "rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100":
      !isCurrentUserSender && !isStoryReply,
  });

  const renderMessageContent = () => (
    <div>
      <div
        className={messageContentClasses}
        style={isLongMessage && !isStoryReply ? { maxWidth: "450px" } : {}}
      >
        {!isStoryReply && renderMessageHeader()}

        {isEditing ? (
          <div className="py-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              autoFocus
              disabled={isSaving}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || editedText.trim() === ""}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check size={14} />
                שמור
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                <X size={14} />
                ביטול
              </button>
            </div>
          </div>
        ) : isStoryReply ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-600 font-medium px-1">
              {isCurrentUserSender ? "הגבת לסטורי שלהם" : "הגיבו לסטורי שלך"}
            </div>

            <div className="relative inline-block group">
              <div className="w-48 h-80 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100">
                {getStoryImageFromMessage() && (
                  <Image
                    src={getStoryImageFromMessage()!}
                    alt="Story"
                    width={192}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div
                className={clsx(
                  "absolute -bottom-4 w-4 h-16  flex items-center justify-center",
                  {
                    "right-0": isCurrentUserSender,
                    "left-0": !isCurrentUserSender,
                  }
                )}
              >
                <span className="text-5xl leading-none">
                  {getStoryReplyText()}
                </span>
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
    </div>
  );

  const renderMessageHeader = () => (
    <div
      className={clsx("flex items-center w-full text-gray-900", {
        "justify-between": isCurrentUserSender,
      })}
    >
      {isCurrentUserSender && (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Message options"
          >
            <MoreHorizontal size={16} className="text-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute top-8 right-0 z-50 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              {!isStoryReply && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit2 size={14} />
                  ערוך
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
                {isDeleting ? "מוחק..." : "מחק"}
              </button>
            </div>
          )}
        </div>
      )}

      {message.dateRead && message.recipientId !== currentUserId ? (
        <span className="text-xs text-black text-italic">
          (נקרא {timeAgo(message.dateRead)})
        </span>
      ) : (
        <div></div>
      )}

      <div className="flex items-center gap-2">
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
        className={clsx("flex mb-4", {
          "gap-3": !isStoryReply,
          "gap-1": isStoryReply,
          "justify-end": isCurrentUserSender,
          "justify-start": !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}

        <div
          className={clsx({
            "flex-1": !isStoryReply,
            "max-w-[85%] sm:max-w-[80%]": !isLongMessage && !isStoryReply,
            "flex-shrink-0": isStoryReply,
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
