import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  senderId: string,
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
  limit = 10,
) {
  console.time("dbGetMessagesByContainer");
  const isOutbox = container === "outbox";

  // Cursor is applied on the OUTER (conversation-level) query, not inside the
  // DISTINCT ON subquery. This guarantees each page returns new conversation
  // partners rather than older messages from partners already shown on page 1.
  const cursorFilter = cursor
    ? Prisma.sql`WHERE created < ${new Date(cursor)}`
    : Prisma.empty;

  const rows = isOutbox
    ? await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM (
          SELECT DISTINCT ON ("recipientId") id, created
          FROM "Message"
          WHERE "senderId" = ${userId}
            AND "senderDeleted" = false
            AND "isArchived" = false
          ORDER BY "recipientId", created DESC
        ) sub
        ${cursorFilter}
        ORDER BY created DESC
        LIMIT ${limit + 1}
      `
    : await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM (
          SELECT DISTINCT ON ("senderId") id, created
          FROM "Message"
          WHERE "recipientId" = ${userId}
            AND "recipientDeleted" = false
            AND "isArchived" = false
          ORDER BY "senderId", created DESC
        ) sub
        ${cursorFilter}
        ORDER BY created DESC
        LIMIT ${limit + 1}
      `;

  if (rows.length === 0) {
    console.timeEnd("dbGetMessagesByContainer");
    return [];
  }

  const ids = rows.map((r) => r.id);

  // Simple PK lookup — extremely fast regardless of table size.
  const messages = await prisma.message.findMany({
    where: { id: { in: ids } },
    orderBy: { created: "desc" },
    select: messageSelect,
  });

  const sorted = messages.sort((a, b) => b.created.getTime() - a.created.getTime());
  console.timeEnd("dbGetMessagesByContainer");
  return sorted;
}

export async function dbDeleteMessage(
  messageId: string,
  selector: "senderDeleted" | "recipientDeleted",
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
      id: true,
      isStarred: true,
      senderId: true,
      recipientId: true,
      isArchived: true,
    },
  });
}

export async function dbToggleMessageStar(
  messageId: string,
  isStarred: boolean,
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
  isArchived: boolean,
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

export async function dbGetStarredMessages(userId: string) {
  return prisma.message.findMany({
    where: {
      isStarred: true,
      OR: [
        { recipientId: userId, recipientDeleted: false },
        { senderId: userId, senderDeleted: false },
      ],
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

export async function dbGetArchivedMessages(userId: string) {
  return prisma.message.findMany({
    where: {
      isArchived: true,
      OR: [
        { recipientId: userId, recipientDeleted: false },
        { senderId: userId, senderDeleted: false },
      ],
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

export async function dbUpdateMessage(messageId: string, text: string) {
  return prisma.message.update({
    where: { id: messageId },
    data: { text },
    select: messageSelect,
  });
}


export async function dbGetReceivedCountsByPartner(
  userId: string,
): Promise<Record<string, number>> {
  const groups = await prisma.message.groupBy({
    by: ["senderId"],
    where: { recipientId: userId, senderId: { not: null } },
    _count: { _all: true },
  });
  const result: Record<string, number> = {};
  for (const g of groups) {
    if (g.senderId) result[g.senderId] = g._count._all;
  }
  return result;
}

export async function dbGetHasReachedSendQuota(
  userId: string,
  limit: number,
): Promise<boolean> {
  const groups = await prisma.message.groupBy({
    by: ["recipientId"],
    where: { senderId: userId, recipientId: { not: null } },
    _count: { _all: true },
  });
  return groups.some((g) => g._count._all >= limit);
}

export async function dbCreateMessageWithLimit(
  text: string,
  recipientId: string,
  senderId: string,
  limit: number,
) {
  return prisma.$transaction(
    async (tx) => {
      const count = await tx.message.count({
        where: { senderId, recipientId },
      });
      if (count >= limit) {
        throw new Error("MESSAGE_LIMIT_REACHED");
      }
      const message = await tx.message.create({
        data: { text, recipientId, senderId },
        select: messageSelect,
      });
      return { message, remainingQuota: limit - (count + 1) };
    },
    { isolationLevel: "Serializable" },
  );
}
