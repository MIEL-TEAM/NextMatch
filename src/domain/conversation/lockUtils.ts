import type { MessageWithSenderRecipient } from "@/types";

export function applyLocks(
  messages: MessageWithSenderRecipient[],
  currentUserId: string,
  isPremium: boolean,
): Array<MessageWithSenderRecipient & { locked: boolean }> {
  let lockFromTime: Date | null = null;

  if (!isPremium) {
    const receivedByTime = messages
      .filter((m) => m.sender?.userId !== currentUserId)
      .sort((a, b) => a.created.getTime() - b.created.getTime());

    if (receivedByTime.length >= 5) {
      lockFromTime = receivedByTime[4].created;
    }
  }

  return messages.map((message) => ({
    ...message,
    locked:
      lockFromTime !== null &&
      message.sender?.userId !== currentUserId &&
      message.created > lockFromTime,
  }));
}
