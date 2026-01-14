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
  dbUpdateMessage,
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

export async function deleteMessage(
  messageId: string,
  recipientUserIdOrIsOutbox: string | boolean
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthUserId();

    const isFromMessagesList = typeof recipientUserIdOrIsOutbox === "boolean";
    const isOutbox = isFromMessagesList ? recipientUserIdOrIsOutbox : false;

    const message = await dbGetMessage(messageId);
    if (!message) {
      return { status: "error", error: "Message not found" };
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      return { status: "error", error: "Unauthorized to delete this message" };
    }

    let selector: "senderDeleted" | "recipientDeleted";
    let recipientUserId: string | null = null;

    if (isFromMessagesList) {
      selector = isOutbox ? "senderDeleted" : "recipientDeleted";
    } else {
      if (message.senderId !== userId) {
        return { status: "error", error: "Can only delete your own messages" };
      }
      selector = "senderDeleted";
      recipientUserId = recipientUserIdOrIsOutbox as string;
    }

    // Mark as deleted
    await dbDeleteMessage(messageId, selector);

    // Check if message should be permanently deleted
    const messagesToDelete = await dbGetMessagesToDelete(userId);
    if (messagesToDelete.length > 0) {
      await dbDeleteMessagesPermanently(
        messagesToDelete.map((message) => message.id)
      );
    }

    // Notify recipient via Pusher (only in chat context)
    if (!isFromMessagesList && recipientUserId) {
      await pusherServer.trigger(
        createChatId(userId, recipientUserId),
        "message:delete",
        messageId
      );
    }

    return { status: "success", data: messageId };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "Failed to delete message" };
  }
}

export async function editMessage(
  messageId: string,
  newText: string,
  recipientUserId: string
): Promise<ActionResult<MessageDto>> {
  try {
    const userId = await getAuthUserId();

    // Validate the new text
    const validated = messagesSchema.safeParse({ text: newText });
    if (!validated.success) {
      return { status: "error", error: validated.error.errors };
    }

    // Verify the user owns this message
    const message = await dbGetMessage(messageId);
    if (!message || message.senderId !== userId) {
      return { status: "error", error: "Unauthorized to edit this message" };
    }

    // Update the message
    const updatedMessage = await dbUpdateMessage(messageId, newText);

    const messageDto = {
      ...mapMessageToMessageDto(updatedMessage),
      currentUserId: userId,
    };

    // Notify recipient via Pusher
    await pusherServer.trigger(
      createChatId(userId, recipientUserId),
      "message:edit",
      messageDto
    );

    return { status: "success", data: messageDto };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "Failed to edit message" };
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
