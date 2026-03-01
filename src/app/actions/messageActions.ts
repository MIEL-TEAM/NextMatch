"use server";

import { MessageSchema, messagesSchema } from "@/lib/schemas/messagesSchema";
import { ActionResult, MessageDto } from "@/types";
import { getAuthUserId } from "@/lib/session";
import { ConversationService } from "@/domain/conversation/ConversationService";

// ─── Send ─────────────────────────────────────────────────────────────────────

export async function createMessgae(
  recipientUserId: string,
  data: MessageSchema,
): Promise<ActionResult<MessageDto>> {
  try {
    const userId = await getAuthUserId();

    const validated = messagesSchema.safeParse(data);
    if (!validated.success)
      return { status: "error", error: validated.error.errors };

    const messageDto = await ConversationService.createMessage(
      userId,
      recipientUserId,
      validated.data.text,
    );

    return { status: "success", data: messageDto };
  } catch (error) {
    if (error instanceof Error && error.message === "MESSAGE_LIMIT_REACHED") {
      return { status: "error", error: "MESSAGE_LIMIT_REACHED" };
    }
    console.log(error);
    return { status: "error", error: "something went wrong" };
  }
}

// ─── Thread ───────────────────────────────────────────────────────────────────

export async function getMessageThread(recipientId: string) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.getThread(userId, recipientId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Inbox / containers ───────────────────────────────────────────────────────

export async function getMessageByContainer(
  container?: string | null,
  cursor?: string,
  limit = 10,
) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.getInbox(userId, container, cursor, limit);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteMessage(
  messageId: string,
  recipientUserIdOrIsOutbox: string | boolean,
): Promise<ActionResult<string>> {
  try {
    const userId = await getAuthUserId();
    const data = await ConversationService.deleteMessage(
      userId,
      messageId,
      recipientUserIdOrIsOutbox,
    );
    return { status: "success", data };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export async function editMessage(
  messageId: string,
  newText: string,
  recipientUserId: string,
): Promise<ActionResult<MessageDto>> {
  try {
    const userId = await getAuthUserId();

    const validated = messagesSchema.safeParse({ text: newText });
    if (!validated.success) {
      return { status: "error", error: validated.error.errors };
    }

    const messageDto = await ConversationService.editMessage(
      userId,
      messageId,
      validated.data.text,
      recipientUserId,
    );

    return { status: "success", data: messageDto };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to edit message",
    };
  }
}

// ─── Unread count ─────────────────────────────────────────────────────────────

export async function getUnreadMessageCount() {
  try {
    const userId = await getAuthUserId();
    return ConversationService.getUnreadCount(userId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Star ─────────────────────────────────────────────────────────────────────

export async function toggleMessageStar(messageId: string) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.toggleStar(userId, messageId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Archive ──────────────────────────────────────────────────────────────────

export async function toggleMessageArchive(messageId: string) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.toggleArchive(userId, messageId);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Starred messages ─────────────────────────────────────────────────────────

export async function getStarredMessages(cursor?: string, limit = 10) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.getStarredMessages(userId, cursor, limit);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ─── Archived messages ────────────────────────────────────────────────────────

export async function getArchivedMessages(cursor?: string, limit = 10) {
  try {
    const userId = await getAuthUserId();
    return ConversationService.getArchivedMessages(userId, cursor, limit);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
