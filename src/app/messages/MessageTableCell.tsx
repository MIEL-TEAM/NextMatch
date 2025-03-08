import { useState } from "react";
import { MessageDto } from "@/types";
import { Button, Tooltip } from "@nextui-org/react";
import { Trash } from "lucide-react";
import { timeAgo } from "@/lib/util";
import AppModal from "@/components/AppModal";

type MessageTableCellProps = {
  item: MessageDto;
  columnKey: string;
  isOutbox: boolean;
  deleteMessage: (message: MessageDto) => void;
  isDeleting: boolean;
};

export default function MessageTableCell({
  item,
  columnKey,
  isOutbox,
  deleteMessage,
  isDeleting,
}: MessageTableCellProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteMessage(item);
    setIsDeleteModalOpen(false);
  };

  const renderContent = () => {
    switch (columnKey) {
      case "senderName":
      case "recipientName":
        return <span>{isOutbox ? item.recipientName : item.senderName}</span>;

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
          <>
            <Tooltip content="מחק שיחה">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="default"
                isLoading={isDeleting}
                onPress={() => handleDeleteClick}
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
                    {isOutbox ? item.recipientName : item.senderName}
                  </strong>
                  ?
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
          </>
        );

      default:
        return null;
    }
  };

  return renderContent();
}
