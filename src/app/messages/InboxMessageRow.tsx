"use client";

import React, { useState } from "react";
import LightAvatar from "@/components/ui/LightAvatar";
import Icon from "@/lib/table/Icon";
import { useRouter } from "next/navigation";
import useConversationStore from "@/store/conversationStore";
import { toggleMessageStar, toggleMessageArchive } from "@/app/actions/messageActions";
import { MessageDto } from "@/types";
import { timeAgo } from "@/lib/util";

interface InboxMessageRowProps {
  conversationId: string;
  authUserId: string | null;
  isPremium: boolean;
  onDeleteRequest: (item: MessageDto) => void;
}

function InboxMessageRow({ conversationId, authUserId, isPremium, onDeleteRequest }: InboxMessageRowProps) {
  const router = useRouter();
  const conversation = useConversationStore((s) => s.conversations[conversationId]);
  const updateConversationMessage = useConversationStore((s) => s.updateConversationMessage);
  const removeConversation = useConversationStore((s) => s.removeConversation);
  const isQuotaReached = useConversationStore((s) => s.isQuotaReached);

  const [isStarring, setIsStarring] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveDisabled, setIsArchiveDisabled] = useState(false);

  const item = conversation?.latestMessage;
  if (!item) return null;

  const isSender = item.senderId === authUserId;
  const displayName = isSender ? item.recipientName : item.senderName;
  const src = (isSender ? item.recipientImage : item.senderImage) || undefined;
  const raw = item.text ?? "";
  const text = raw.length > 40 ? raw.substring(0, 40) + "..." : raw;
  const isUnread = !item.dateRead;
  const shouldBlurPreview = !isPremium && isQuotaReached && !isSender;

  const handleRowClick = () => {
    const partnerId = isSender ? item.recipientId : item.senderId;
    if (!partnerId) return;
    router.push(`/members/${partnerId}/chat`);
  };

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isStarring) return;
    setIsStarring(true);
    const prev = item.isStarred;
    updateConversationMessage(conversationId, { isStarred: !prev });
    try {
      await toggleMessageStar(item.id);
    } catch {
      updateConversationMessage(conversationId, { isStarred: prev });
    } finally {
      setIsStarring(false);
    }
  };

  const handleArchiveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isArchiving || isArchiveDisabled) return;
    setIsArchiving(true);
    setIsArchiveDisabled(true);
    try {
      await toggleMessageArchive(item.id);
      removeConversation(conversationId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsArchiving(false);
      setTimeout(() => setIsArchiveDisabled(false), 3000);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRequest(item);
  };

  return (
    <tr
      className={`cursor-pointer${isUnread ? " font-semibold" : ""}`}
      onClick={handleRowClick}
    >
      <td className="truncate max-w-64">
        <div className="flex items-center gap-3">
          <LightAvatar src={src} name={displayName ?? ""} />
          <span className="flex items-center gap-1">
            {displayName}
            {item.isStarred && (
              <Icon name="star-sharp" type="sol" className="size-3.5 bg-amber-500 inline" />
            )}
          </span>
        </div>
      </td>
      <td className="truncate max-w-64">
        <span className={shouldBlurPreview ? "blur-sm select-none pointer-events-none text-gray-600" : "text-gray-600"}>
          {text}
        </span>
      </td>
      <td className="truncate max-w-64">
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {timeAgo(item.created)}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="סמן בכוכב"
            title="סמן בכוכב"
            disabled={isStarring}
            onClick={handleStarClick}
            className={`min-w-8 h-8 inline-flex items-center justify-center rounded-md disabled:opacity-50 ${item.isStarred ? "bg-amber-100 text-amber-500" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <Icon name="star-sharp" type={item.isStarred ? "sol" : "lit"} className={item.isStarred ? "size-4 bg-amber-500" : "size-4 bg-gray-400"} />
          </button>

          <button
            type="button"
            aria-label={item.isArchived ? "הוצא מהארכיון" : "העבר לארכיון"}
            title={item.isArchived ? "הוצא מהארכיון" : "העבר לארכיון"}
            disabled={isArchiving || isArchiveDisabled}
            onClick={handleArchiveClick}
            className={`min-w-8 h-8 inline-flex items-center justify-center rounded-md disabled:opacity-50 ${item.isArchived ? "bg-primary/10 text-primary" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <Icon name="box-archive" className={item.isArchived ? "size-4 bg-primary" : "size-4 bg-gray-400"} />
          </button>

          <button
            type="button"
            aria-label="מחק שיחה"
            title="מחק שיחה"
            onClick={handleDeleteClick}
            className="min-w-8 h-8 inline-flex items-center justify-center rounded-md text-red-400 hover:bg-red-50"
          >
            <Icon name="trash" className="size-4 bg-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default React.memo(InboxMessageRow);
