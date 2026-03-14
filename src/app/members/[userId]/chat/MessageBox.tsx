"use client";

import PresenceAvatar from "@/components/PresenceAvatar";
import { formatShortDateTime, timeAgo, transformImageUrl } from "@/lib/util";
import { MessageBoxProps } from "@/types/chat";

import clsx from "clsx";
import React, { useEffect, useRef, memo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/lib/table/Icon";
import { deleteMessage, editMessage } from "@/app/actions/messageActions";
import { toast } from "sonner";
import useUpgradeModal from "@/hooks/useUpgradeModal";

function MessageBox({ message, currentUserId, isFirstLocked: _isFirstLocked }: MessageBoxProps) {
  const isOptimistic = message.id.startsWith("optimistic-");
  const isCurrentUserSender = message.senderId === currentUserId;
  const isLocked = message.locked === true;
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLongMessage = message.text.length > 50;

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

  const renderAvatar = () => {
    if (isOptimistic && !message.senderImage) {
      return <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 self-end" />;
    }
    return (
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
  };

  const messageContentClasses = clsx("flex flex-col px-2 py-1 w-full", {
    "rounded-l-xl rounded-tr-xl text-white bg-blue-100": isCurrentUserSender,
    "rounded-r-xl rounded-tl-xl border-gray-200 bg-green-100": !isCurrentUserSender,
  });

  const renderMessageContent = () => (
    <div className="flex flex-col">
      <div
        className={messageContentClasses}
        style={isLongMessage ? { maxWidth: "450px" } : {}}
      >
        {renderMessageHeader()}

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
                <Icon name="check" className="size-3.5 bg-white" />
                שמור
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                <Icon name="xmark" className="size-3.5 bg-gray-700" />
                ביטול
              </button>
            </div>
          </div>
        ) : isLocked ? (
          <div className="relative py-3">
            <p
              className={clsx("text-sm text-gray-900", {
                "break-words whitespace-normal": isLongMessage,
              })}
              style={isLongMessage ? { wordBreak: "break-word" } : {}}
            >
              <span className="blur-sm select-none pointer-events-none">
                {message.text}
              </span>
            </p>
            <button
              className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700"
              onClick={() => useUpgradeModal.getState().open()}
            >
              <Icon name="lock" className="size-3.5 bg-gray-700" /> פתח את ההודעה עם Miel+
            </button>
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
            <Icon name="ellipsis" className="size-4 bg-gray-600" />
          </button>

          {showMenu && (
            <div className="absolute top-8 right-0 z-50 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Icon name="pen-to-square" className="size-3.5 bg-gray-700" />
                ערוך
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Icon name="trash" className="size-3.5 bg-red-600" />
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
        className={clsx("flex mb-4 gap-3", {
          "justify-end": isCurrentUserSender,
          "justify-start": !isCurrentUserSender,
        })}
      >
        {!isCurrentUserSender && renderAvatar()}

        <div
          className={clsx({
            "flex-1": true,
            "max-w-[85%] sm:max-w-[80%]": !isLongMessage,
          })}
        >
          {renderMessageContent()}
        </div>

        {isCurrentUserSender && renderAvatar()}
      </div>
    </div>
  );
}

export default memo(MessageBox);
