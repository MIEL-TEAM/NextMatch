"use server";

import { MessageSchema, messagesSchema } from "@/lib/schemas/messagesSchema";
import { ActionResult, MessageDto } from "@/types";
import { getAuthUserId } from "@/lib/session";
import { mapMessageToMessageDto } from "@/lib/mappings";
import { pusherServer } from "@/lib/pusher";
import { createChatId } from "@/lib/util";
import { trackUserInteraction } from "./smartMatchActions";
import {
  sendImmediateMessageEmail,
  scheduleReminderEmail,
  cancelReminderEmail,
} from "@/lib/email-rate-limiting";
import {
  dbArchiveMessages,
  dbCreateMessage,
  dbDeleteMessage,
  dbDeleteMessagesPermanently,
  dbGetArchivedMessages,
  dbGetMessage,
  dbGetMessageForDto,
  dbGetMessagesByContainer,
  dbGetMessagesToDelete,
  dbGetMessageThread,
  dbGetStarredMessages,
  dbGetUnreadMessageCount,
  dbMarkMessagesAsRead,
  dbToggleMessageStar,
} from "@/lib/db/messageActions";

export async function createMessgae(
  recipientUserId: string,
  data: MessageSchema
): Promise<ActionResult<MessageDto>> {
  try {
    const userId = await getAuthUserId();
    const validated = messagesSchema.safeParse(data);

    if (!validated.success)
      return { status: "error", error: validated.error.errors };

    const { text } = validated.data;

    const message = await dbCreateMessage(text, recipientUserId, userId);

    await trackUserInteraction(recipientUserId, "message").catch((e) =>
      console.error("Failed to track message interaction:", e)
    );

    const messageDto = {
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    };

    await pusherServer.trigger(
      createChatId(userId, recipientUserId),
      "message:new",
      messageDto
    );
    await pusherServer.trigger(
      `private-${recipientUserId}`,
      "message:new",
      messageDto
    );

    const conversationId = createChatId(userId, recipientUserId);

    // Send immediate email if user is offline
    const emailSent = await sendImmediateMessageEmail(
      message.id,
      conversationId,
      userId,
      recipientUserId,
      text
    );

    // Schedule reminder email for 2 hours later if message still unread
    if (emailSent) {
      await scheduleReminderEmail(
        message.id,
        conversationId,
        recipientUserId,
        2
      );
    }

    return { status: "success", data: messageDto };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "something went wrong" };
  }
}

export async function getMessageThread(recipientId: string) {
  try {
    const userId = await getAuthUserId();
    const messages = await dbGetMessageThread(userId, recipientId);

    let readCount = 0;

    if (messages.length > 0) {
      const readMessagesIds = messages
        .filter(
          (message) =>
            message.dateRead === null &&
            message.recipient?.userId &&
            message.sender?.userId === recipientId
        )
        .map((message) => message.id);

      await dbMarkMessagesAsRead(readMessagesIds);

      readCount = readMessagesIds.length;

      await pusherServer.trigger(
        createChatId(recipientId, userId),
        "messages:read",
        readMessagesIds
      );

      // 📧 Cancel any reminder emails for messages that were just read
      for (const messageId of readMessagesIds) {
        await cancelReminderEmail(messageId);
      }
    }

    const messagesToReturn = messages.map((message) => ({
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    }));

    return { messages: messagesToReturn, readCount };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getMessageByContainer(
  container?: string | null,
  cursor?: string,
  limit = 10
) {
  try {
    const userId = await getAuthUserId();

    const messages = await dbGetMessagesByContainer(
      userId,
      container,
      cursor,
      limit
    );

    let nextCursor: string | undefined;

    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.created.toISOString();
    } else {
      nextCursor = undefined;
    }

    const messagesToReturn = messages.map((message) => ({
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    }));

    return {
      messages: messagesToReturn,
      nextCursor,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteMessage(messageId: string, isOutbox: boolean) {
  const selector = isOutbox ? "senderDeleted" : "recipientDeleted";

  try {
    const userId = await getAuthUserId();
    await dbDeleteMessage(messageId, selector);

    const messagesToDelete = await dbGetMessagesToDelete(userId);

    if (messagesToDelete.length > 0) {
      await dbDeleteMessagesPermanently(
        messagesToDelete.map((message) => message.id)
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUnreadMessageCount() {
  try {
    const userId = await getAuthUserId();

    return dbGetUnreadMessageCount(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleMessageStar(messageId: string) {
  try {
    const userId = await getAuthUserId();
    const message = await dbGetMessage(messageId);

    if (
      !message ||
      (message.senderId !== userId && message.recipientId !== userId)
    ) {
      throw new Error("Unauthorized access to message");
    }

    const updatedMessage = await dbToggleMessageStar(
      messageId,
      !message.isStarred
    );

    return mapMessageToMessageDto(updatedMessage);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleMessageArchive(messageId: string) {
  try {
    const userId = await getAuthUserId();

    const message = await dbGetMessage(messageId);

    if (
      !message ||
      (message.senderId !== userId && message.recipientId !== userId)
    ) {
      throw new Error("Unauthorized access to message");
    }

    const partnerId =
      message.senderId === userId ? message.recipientId : message.senderId;

    if (!partnerId) {
      throw new Error("Could not determine conversation partner");
    }

    await dbArchiveMessages(userId, partnerId, !message.isArchived);

    const updatedMessage = await dbGetMessageForDto(messageId);

    return updatedMessage ? mapMessageToMessageDto(updatedMessage) : null;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getStarredMessages(cursor?: string, limit = 10) {
  try {
    const userId = await getAuthUserId();

    const starredMessages = await dbGetStarredMessages(userId, cursor);

    const conversationMap = new Map<string, (typeof starredMessages)[0]>();

    starredMessages.forEach((message) => {
      const partnerId =
        message.sender?.userId === userId
          ? message.recipient?.userId
          : message.sender?.userId;

      if (!partnerId) return;

      const key = partnerId.toString();
      const existing = conversationMap.get(key);

      if (!existing || new Date(message.created) > new Date(existing.created)) {
        conversationMap.set(key, message);
      }
    });

    const groupedMessages = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    const paginated = groupedMessages.slice(0, limit + 1);

    let nextCursor: string | undefined;
    if (paginated.length > limit) {
      const nextItem = paginated.pop();
      nextCursor = nextItem?.created.toISOString();
    } else {
      nextCursor = undefined;
    }

    const messagesToReturn = paginated.map((message) => ({
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    }));

    return {
      messages: messagesToReturn,
      nextCursor,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getArchivedMessages(cursor?: string, limit = 10) {
  try {
    const userId = await getAuthUserId();

    const archivedMessages = await dbGetArchivedMessages(userId, cursor);

    const conversationMap = new Map<string, (typeof archivedMessages)[0]>();

    archivedMessages.forEach((message) => {
      const partnerId =
        message.sender?.userId === userId
          ? message.recipient?.userId
          : message.sender?.userId;

      if (!partnerId) return;

      const key = partnerId.toString();
      const existing = conversationMap.get(key);

      if (!existing || new Date(message.created) > new Date(existing.created)) {
        conversationMap.set(key, message);
      }
    });

    const groupedMessages = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    const paginated = groupedMessages.slice(0, limit + 1);

    let nextCursor: string | undefined;
    if (paginated.length > limit) {
      const nextItem = paginated.pop();
      nextCursor = nextItem?.created.toISOString();
    } else {
      nextCursor = undefined;
    }

    const messagesToReturn = paginated.map((message) => ({
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    }));

    return {
      messages: messagesToReturn,
      nextCursor,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
