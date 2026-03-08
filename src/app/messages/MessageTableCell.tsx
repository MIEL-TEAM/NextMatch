import { useState } from "react";
import Icon from "@/lib/table/Icon";
import { timeAgo } from "@/lib/util";
import { MessageTableCellProps } from "@/types/messageStore";


export default function MessageTableCell({
  item,
  columnKey,
  isOutbox,
  onDeleteRequest,
  starMessage,
  archiveMessage,
  isDeleting,
  isStarring,
  isArchiving,
  isLocked,
}: MessageTableCellProps) {
  const [isArchiveDisabled, setIsArchiveDisabled] = useState(false);

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>, callback: () => void) => {
    event.preventDefault();
    event.stopPropagation();
    callback();
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isArchiving || isArchiveDisabled) return;
    setIsArchiveDisabled(true);
    archiveMessage(item);
    setTimeout(() => setIsArchiveDisabled(false), 3000);
  };

  const renderContent = () => {
    switch (columnKey) {
      case "senderName":
      case "recipientName":
        let displayName;

        if (item.senderId === item.recipientId) {
          displayName = item.senderName;
        } else if (item.currentUserId) {
          if (item.currentUserId === item.senderId) {
            displayName = item.recipientName;
          } else if (item.currentUserId === item.recipientId) {
            displayName = item.senderName;
          } else {
            displayName = isOutbox ? item.recipientName : item.senderName;
          }
        } else {
          displayName = isOutbox ? item.recipientName : item.senderName;
        }

        return (
          <span className="flex items-center gap-1">
            {displayName}
            {item.isStarred && (
              <Icon name="star-sharp" type="sol" className="size-3.5 bg-amber-500 inline" />
            )}
          </span>
        );

      case "text":
        return isLocked ? (
          <span className="blur-sm select-none pointer-events-none text-gray-600">
            {truncateText(item.text)}
          </span>
        ) : (
          <span className="text-gray-600">{truncateText(item.text)}</span>
        );

      case "created":
        return (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {timeAgo(item.created)}
          </span>
        );

      case "actions":
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="סמן בכוכב"
              title="סמן בכוכב"
              disabled={isStarring}
              onClick={(e) => handleButtonClick(e, () => starMessage(item))}
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
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteRequest(item);
              }}
              className="min-w-8 h-8 inline-flex items-center justify-center rounded-md disabled:opacity-50 text-red-400 hover:bg-red-50"
            >
              <Icon name="trash" className="size-4 bg-red-400" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
}
