import type { MessageDto } from "@/types";

export const FREE_MESSAGE_LIMIT = 5;

export function recomputeLocks(
  messages: MessageDto[],
  currentUserId: string,
  isPremium: boolean,
): MessageDto[] {
  if (isPremium) {
    return messages.map((m) => ({ ...m, locked: false }));
  }

  const received = messages.filter((m) => m.senderId !== currentUserId);

  if (received.length < FREE_MESSAGE_LIMIT) {
    return messages.map((m) => ({ ...m, locked: false }));
  }

  const lockedIds = new Set(received.slice(FREE_MESSAGE_LIMIT).map((m) => m.id));
  return messages.map((m) => ({ ...m, locked: lockedIds.has(m.id) }));
}
