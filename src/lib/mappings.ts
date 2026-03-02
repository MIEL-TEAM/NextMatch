import { MessageWithSenderRecipient } from "@/types";

export function mapMessageToMessageDto(message: MessageWithSenderRecipient) {
  return {
    id: message.id,
    text: message.text,
    created: message.created.toISOString(),
    dateRead: message.dateRead ? message.dateRead.toISOString() : null,
    senderId: message.sender?.userId,
    senderName: message.sender?.name,
    senderImage: message.sender?.image,
    recipientId: message.recipient?.userId,
    recipientImage: message.recipient?.image,
    recipientName: message.recipient?.name,
    isStarred: message.isStarred,
    isArchived: message.isArchived,
  };
}
