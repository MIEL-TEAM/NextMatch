import { useState } from "react";
import { MessageDto } from "@/types";
import { Button, Tooltip } from "@nextui-org/react";
import { Trash, Star, Archive } from "lucide-react";
import { timeAgo } from "@/lib/util";
import AppModal from "@/components/AppModal";

type MessageTableCellProps = {
  item: MessageDto;
  columnKey: string;
  isOutbox: boolean;
  deleteMessage: (message: MessageDto) => void;
  starMessage: (message: MessageDto) => void;
  archiveMessage: (message: MessageDto) => void;
  isDeleting: boolean;
  isStarring: boolean;
  isArchiving: boolean;
};

export default function MessageTableCell({
  item,
  columnKey,
  isOutbox,
  deleteMessage,
  starMessage,
  archiveMessage,
  isDeleting,
  isStarring,
  isArchiving,
}: MessageTableCellProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveDisabled, setIsArchiveDisabled] = useState(false);

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleDeleteClick = (event: any) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    setIsDeleteModalOpen(true);
  };

  const handleButtonClick = (event: React.MouseEvent, callback: () => void) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    callback();
  };

  const handleArchiveClick = (e: any) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    if (isArchiving || isArchiveDisabled) return;

    setIsArchiveDisabled(true);
    archiveMessage(item);

    setTimeout(() => {
      setIsArchiveDisabled(false);
    }, 3000);
  };

  const confirmDelete = () => {
    deleteMessage(item);
    setIsDeleteModalOpen(false);
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
              <Star
                size={14}
                className="text-amber-500 inline"
                fill="currentColor"
              />
            )}
          </span>
        );

      case "text":
        return <span className="text-gray-600">{truncateText(item.text)}</span>;

      case "created":
        return (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {timeAgo(item.created)}
          </span>
        );

      case "actions":
        return (
          <div className="flex items-center gap-1">
            <Tooltip content="סמן בכוכב">
              <Button
                isIconOnly
                size="sm"
                variant={item.isStarred ? "solid" : "light"}
                color={item.isStarred ? "warning" : "default"}
                isLoading={isStarring}
                onPress={(e) =>
                  handleButtonClick(e as any, () => starMessage(item))
                }
                className="min-w-8 h-8"
              >
                <Star size={16} />
              </Button>
            </Tooltip>

            <Tooltip
              content={item.isArchived ? "הוצא מהארכיון" : "העבר לארכיון"}
            >
              <Button
                isIconOnly
                size="sm"
                variant={item.isArchived ? "solid" : "light"}
                color={item.isArchived ? "primary" : "default"}
                isLoading={isArchiving}
                isDisabled={isArchiveDisabled}
                onPress={handleArchiveClick}
                className="min-w-8 h-8"
              >
                <Archive size={16} />
              </Button>
            </Tooltip>

            <Tooltip content="מחק שיחה">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                isLoading={isDeleting}
                onPress={handleDeleteClick}
                className="min-w-8 h-8"
              >
                <Trash size={16} />
              </Button>
            </Tooltip>

            <AppModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              header="מחיקת שיחה"
              body={
                <p>
                  האם את/ה בטוח/ה שברצונך למחוק את השיחה עם
                  <strong>
                    {` ${isOutbox ? item.recipientName : item.senderName}? `}
                  </strong>
                </p>
              }
              footerButtons={[
                {
                  color: "default",
                  onPress: confirmDelete,
                  children: "מחק",
                  isLoading: isDeleting,
                },
                {
                  color: "default",
                  variant: "light",
                  onPress: () => setIsDeleteModalOpen(false),
                  children: "ביטול",
                },
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
}
