import { mapMessageToMessageDto } from "@/lib/mappings";
import { createChatId } from "@/lib/util";
import { isActivePremium } from "@/lib/premiumUtils";
import { dbGetUserForNav } from "@/lib/db/userActions";
import {
  cancelReminderEmail,
  scheduleReminderEmail,
  sendImmediateMessageEmail,
} from "@/lib/email-rate-limiting";
import { notifyNewMessage } from "@/lib/notifications/notificationService";
import { trackUserInteraction } from "@/app/actions/smartMatchActions";
import {
  dbArchiveMessages,
  dbCreateMessage,
  dbCreateMessageWithLimit,
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
import { randomUUID } from "crypto";
import { MessageDto } from "@/types";
import { applyLocks } from "./lockUtils";
import { emitConversationEvent, emitEvent } from "./eventEmitter";

export class ConversationService {
  // ─── Thread ──────────────────────────────────────────────────────────────

  static async getThread(
    userId: string,
    recipientId: string,
  ): Promise<{ messages: MessageDto[]; readCount: number }> {
    const messages = await dbGetMessageThread(userId, recipientId);

    let readCount = 0;

    if (messages.length > 0) {
      const readMessagesIds = messages
        .filter(
          (message) =>
            message.dateRead === null &&
            message.recipient?.userId &&
            message.sender?.userId === recipientId,
        )
        .map((message) => message.id);

      await dbMarkMessagesAsRead(readMessagesIds);
      readCount = readMessagesIds.length;

      await emitEvent(
        createChatId(recipientId, userId),
        "messages:read",
        readMessagesIds,
      );

      await emitEvent(`private-${recipientId}`, "messages:read", {
        readBy: userId,
        messageIds: readMessagesIds,
      });

      for (const messageId of readMessagesIds) {
        await cancelReminderEmail(messageId);
      }

      if (readMessagesIds.length > 0) {
        await emitConversationEvent(
          {
            version: 1,
            eventId: randomUUID(),
            type: "READ_RECEIPT",
            conversationId: createChatId(recipientId, userId),
            actorId: userId,
            timestamp: new Date().toISOString(),
            payload: { readBy: userId, messageIds: readMessagesIds },
          },
          [userId, recipientId],
        );
      }
    }

    const user = await dbGetUserForNav(userId);
    const premium = isActivePremium(user);

    const lockedMessages = applyLocks(messages, userId, premium);

    const messagesToReturn = lockedMessages.map((message) => ({
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
      locked: message.locked,
    }));

    return { messages: messagesToReturn, readCount };
  }

  // ─── Inbox / containers ──────────────────────────────────────────────────

  static async getInbox(
    userId: string,
    container?: string | null,
    cursor?: string,
    limit = 10,
  ): Promise<{ messages: MessageDto[]; nextCursor?: string }> {
    const messages = await dbGetMessagesByContainer(
      userId,
      container,
      cursor,
      limit,
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

    return { messages: messagesToReturn, nextCursor };
  }

  // ─── Create ──────────────────────────────────────────────────────────────

  static async createMessage(
    userId: string,
    recipientUserId: string,
    text: string,
  ): Promise<MessageDto> {
    const user = await dbGetUserForNav(userId);
    const premium = isActivePremium(user);

    let message: Awaited<ReturnType<typeof dbCreateMessage>>;

    if (premium) {
      message = await dbCreateMessage(text, recipientUserId, userId);
    } else {
      message = await dbCreateMessageWithLimit(text, recipientUserId, userId, 5);
    }

    await trackUserInteraction(recipientUserId, "message").catch((e) =>
      console.error("Failed to track message interaction:", e),
    );

    const messageDto = {
      ...mapMessageToMessageDto(message),
      currentUserId: userId,
    };

    await emitEvent(
      createChatId(userId, recipientUserId),
      "message:new",
      messageDto,
    );
    await emitEvent(`private-${recipientUserId}`, "message:new", messageDto);
    await emitEvent(`private-${userId}`, "message:new", messageDto);

    await emitConversationEvent(
      {
        version: 1,
        eventId: randomUUID(),
        type: "MESSAGE_CREATED",
        conversationId: createChatId(userId, recipientUserId),
        actorId: userId,
        timestamp: new Date().toISOString(),
        payload: { message: messageDto },
      },
      [userId, recipientUserId],
    );

    await notifyNewMessage(
      recipientUserId,
      userId,
      messageDto.senderName || "משתמש",
      messageDto.senderImage || null,
      message.id,
      text,
    ).catch((e) => console.error("Failed to create notification:", e));

    const conversationId = createChatId(userId, recipientUserId);

    const emailSent = await sendImmediateMessageEmail(
      message.id,
      conversationId,
      userId,
      recipientUserId,
      text,
    );

    if (emailSent) {
      await scheduleReminderEmail(
        message.id,
        conversationId,
        recipientUserId,
        2,
      );
    }

    return messageDto;
  }

  // ─── Edit ────────────────────────────────────────────────────────────────

  static async editMessage(
    userId: string,
    messageId: string,
    newText: string,
    recipientUserId: string,
  ): Promise<MessageDto> {
    const message = await dbGetMessage(messageId);
    if (!message || message.senderId !== userId) {
      throw new Error("Unauthorized to edit this message");
    }

    const updatedMessage = await dbUpdateMessage(messageId, newText);

    const messageDto = {
      ...mapMessageToMessageDto(updatedMessage),
      currentUserId: userId,
    };

    await emitEvent(
      createChatId(userId, recipientUserId),
      "message:edit",
      messageDto,
    );

    await emitConversationEvent(
      {
        version: 1,
        eventId: randomUUID(),
        type: "MESSAGE_UPDATED",
        conversationId: createChatId(userId, recipientUserId),
        actorId: userId,
        timestamp: new Date().toISOString(),
        payload: { message: messageDto },
      },
      [userId, recipientUserId],
    );

    return messageDto;
  }

  // ─── Delete ──────────────────────────────────────────────────────────────

  static async deleteMessage(
    userId: string,
    messageId: string,
    recipientUserIdOrIsOutbox: string | boolean,
  ): Promise<string> {
    const isFromMessagesList = typeof recipientUserIdOrIsOutbox === "boolean";
    const isOutbox = isFromMessagesList ? recipientUserIdOrIsOutbox : false;

    const message = await dbGetMessage(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new Error("Unauthorized to delete this message");
    }

    let selector: "senderDeleted" | "recipientDeleted";
    let recipientUserId: string | null = null;

    if (isFromMessagesList) {
      selector = isOutbox ? "senderDeleted" : "recipientDeleted";
    } else {
      if (message.senderId !== userId) {
        throw new Error("Can only delete your own messages");
      }
      selector = "senderDeleted";
      recipientUserId = recipientUserIdOrIsOutbox as string;
    }

    await dbDeleteMessage(messageId, selector);

    const messagesToDelete = await dbGetMessagesToDelete(userId);
    if (messagesToDelete.length > 0) {
      await dbDeleteMessagesPermanently(messagesToDelete.map((m) => m.id));
    }

    if (!isFromMessagesList && recipientUserId) {
      await emitEvent(
        createChatId(userId, recipientUserId),
        "message:delete",
        messageId,
      );
    }

    const otherUserId =
      message.senderId === userId ? message.recipientId : message.senderId;

    if (otherUserId) {
      await emitConversationEvent(
        {
          version: 1,
          eventId: randomUUID(),
          type: "MESSAGE_DELETED",
          conversationId: createChatId(userId, otherUserId),
          actorId: userId,
          timestamp: new Date().toISOString(),
          payload: { messageId },
        },
        [userId, otherUserId],
      );
    }

    return messageId;
  }

  // ─── Unread count ────────────────────────────────────────────────────────

  static async getUnreadCount(userId: string): Promise<number> {
    return dbGetUnreadMessageCount(userId);
  }

  // ─── Star ────────────────────────────────────────────────────────────────

  static async toggleStar(userId: string, messageId: string): Promise<MessageDto> {
    const message = await dbGetMessage(messageId);

    if (
      !message ||
      (message.senderId !== userId && message.recipientId !== userId)
    ) {
      throw new Error("Unauthorized access to message");
    }

    const newIsStarred = !message.isStarred;
    const updatedMessage = await dbToggleMessageStar(messageId, newIsStarred);

    const starPartnerId =
      message.senderId === userId ? message.recipientId : message.senderId;

    if (starPartnerId) {
      await emitConversationEvent(
        {
          version: 1,
          eventId: randomUUID(),
          type: "MESSAGE_STARRED",
          conversationId: createChatId(userId, starPartnerId),
          actorId: userId,
          timestamp: new Date().toISOString(),
          payload: { messageId, isStarred: newIsStarred },
        },
        [userId, starPartnerId],
      );
    }

    return mapMessageToMessageDto(updatedMessage);
  }

  // ─── Archive ─────────────────────────────────────────────────────────────

  static async toggleArchive(
    userId: string,
    messageId: string,
  ): Promise<MessageDto | null> {
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

    const newIsArchived = !message.isArchived;
    await dbArchiveMessages(userId, partnerId, newIsArchived);

    await emitConversationEvent(
      {
        version: 1,
        eventId: randomUUID(),
        type: "CONVERSATION_ARCHIVED",
        conversationId: createChatId(userId, partnerId),
        actorId: userId,
        timestamp: new Date().toISOString(),
        payload: { messageId, isArchived: newIsArchived },
      },
      [userId, partnerId],
    );

    const updatedMessage = await dbGetMessageForDto(messageId);

    return updatedMessage ? mapMessageToMessageDto(updatedMessage) : null;
  }

  // ─── Starred messages ────────────────────────────────────────────────────

  static async getStarredMessages(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<{ messages: MessageDto[]; nextCursor?: string }> {
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
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
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

    return { messages: messagesToReturn, nextCursor };
  }

  // ─── Archived messages ───────────────────────────────────────────────────

  static async getArchivedMessages(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<{ messages: MessageDto[]; nextCursor?: string }> {
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
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
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

    return { messages: messagesToReturn, nextCursor };
  }
}
