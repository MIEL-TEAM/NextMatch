import AppModal from "@/components/AppModal";
import PresenceAvatar from "@/components/PresenceAvatar";
import { truncateString } from "@/lib/util";
import { MessageDto } from "@/types";
import { Button, ButtonProps, useDisclosure } from "@nextui-org/react";
import { AiFillDelete } from "react-icons/ai";

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
  const cellValue = item[columnKey as keyof MessageDto];
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onConformDeleteMessage = () => {
    deleteMessage(item);
  };

  const footerButtons: ButtonProps[] = [
    { color: "default", onPress: onClose, children: "ביטול" },
    { color: "secondary", onPress: onConformDeleteMessage, children: "מחק" },
  ];

  switch (columnKey) {
    case "recipientName":
    case "senderName":
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <PresenceAvatar
            src={isOutbox ? item.recipientImage : item.senderImage}
            userId={isOutbox ? item.recipientId : item.senderId}
          />
          <span>{cellValue}</span>
        </div>
      );
    case "text":
      return <div className="truncate">{truncateString(cellValue, 80)}</div>;
    case "created":
      return <div>{cellValue}</div>;
    default:
      return (
        <>
          <Button
            isIconOnly
            variant="light"
            onPress={() => onOpen()}
            isLoading={isDeleting}
          >
            <AiFillDelete size={24} className="text-danger" />
          </Button>

          <AppModal
            isOpen={isOpen}
            onClose={onClose}
            header="רגע, למחוק את ההודעה?"
            body={
              <div>
                האם אתה בטוח שברצונך למחוק הודעה זו? פעולה זו אינה ניתנת לשחזור.
              </div>
            }
            footerButtons={footerButtons}
          />
        </>
      );
  }
}
