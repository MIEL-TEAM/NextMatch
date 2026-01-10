import { prisma } from "@/lib/prisma";

const messageSelect = {
  id: true,
  text: true,
  created: true,
  dateRead: true,
  isStarred: true,
  isArchived: true,
  sender: {
    select: { userId: true, name: true, image: true },
  },
  recipient: {
    select: { userId: true, name: true, image: true },
  },
};

export async function dbCreateMessage(
  text: string,
  recipientId: string,
  senderId: string
) {
  return prisma.message.create({
    data: {
      text,
      recipientId,
      senderId,
    },
    select: messageSelect,
  });
}

export async function dbGetMessageThread(userId: string, recipientId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: userId,
          recipientId,
          senderDeleted: false,
        },
        {
          senderId: recipientId,
          recipientId: userId,
          recipientDeleted: false,
        },
      ],
    },
    orderBy: {
      created: "asc",
    },
    select: messageSelect,
  });
}

export async function dbMarkMessagesAsRead(messageIds: string[]) {
  return prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { dateRead: new Date() },
  });
}

export async function dbGetMessagesByContainer(
  userId: string,
  container: string | undefined | null,
  cursor?: string,
  limit = 10
) {
  const conditions = {
    [container === "outbox" ? "senderId" : "recipientId"]: userId,
    ...(container === "outbox"
      ? { senderDeleted: false }
      : { recipientDeleted: false }),
    isArchived: false,
  };

  return prisma.message.findMany({
    where: {
      ...conditions,
      ...(cursor ? { created: { lt: new Date(cursor) } } : {}),
    },
    orderBy: {
      created: "desc",
    },
    select: messageSelect,
    take: limit + 1,
  });
}

export async function dbDeleteMessage(
  messageId: string,
  selector: "senderDeleted" | "recipientDeleted"
) {
  return prisma.message.update({
    where: { id: messageId },
    data: { [selector]: true },
  });
}

export async function dbGetMessagesToDelete(userId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { recipientId: userId, senderDeleted: true, recipientDeleted: true },
        { senderId: userId, senderDeleted: true, recipientDeleted: true },
      ],
    },
  });
}

export async function dbDeleteMessagesPermanently(messageIds: string[]) {
  return prisma.message.deleteMany({
    where: {
      OR: messageIds.map((id) => ({ id })),
    },
  });
}

export async function dbGetUnreadMessageCount(userId: string) {
  return prisma.message.count({
    where: {
      recipientId: userId,
      dateRead: null,
      recipientDeleted: false,
    },
  });
}

export async function dbGetMessage(messageId: string) {
  return prisma.message.findUnique({
    where: { id: messageId },
    select: {
      isStarred: true,
      senderId: true,
      recipientId: true,
      isArchived: true,
    },
  });
}

export async function dbToggleMessageStar(
  messageId: string,
  isStarred: boolean
) {
  return prisma.message.update({
    where: { id: messageId },
    data: { isStarred },
    select: messageSelect,
  });
}

export async function dbArchiveMessages(
  userId: string,
  partnerId: string,
  isArchived: boolean
) {
  return prisma.message.updateMany({
    where: {
      OR: [
        { senderId: userId, recipientId: partnerId },
        { recipientId: userId, senderId: partnerId },
      ],
    },
    data: {
      isArchived,
    },
  });
}

export async function dbGetMessageForDto(messageId: string) {
  return prisma.message.findUnique({
    where: { id: messageId },
    select: messageSelect,
  });
}

export async function dbGetStarredMessages(userId: string, cursor?: string) {
  return prisma.message.findMany({
    where: {
      isStarred: true,
      OR: [
        { recipientId: userId, recipientDeleted: false },
        { senderId: userId, senderDeleted: false },
      ],
      ...(cursor ? { created: { lt: new Date(cursor) } } : {}),
    },
    orderBy: {
      created: "desc",
    },
    select: {
      ...messageSelect,
      senderId: true,
      recipientId: true,
    },
  });
}

export async function dbGetArchivedMessages(userId: string, cursor?: string) {
  return prisma.message.findMany({
    where: {
      isArchived: true,
      OR: [
        { recipientId: userId, recipientDeleted: false },
        { senderId: userId, senderDeleted: false },
      ],
      ...(cursor ? { created: { lt: new Date(cursor) } } : {}),
    },
    orderBy: {
      created: "desc",
    },
    select: {
      ...messageSelect,
      senderId: true,
      recipientId: true,
    },
  });
}
