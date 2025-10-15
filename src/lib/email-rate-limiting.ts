"use server";

import { prisma } from "@/lib/prisma";
import { sendNewMessageEmail } from "@/lib/mail";

const conversationEmailTracker = new Map<string, Date>();
const scheduledReminderEmails = new Map<string, NodeJS.Timeout>();

export async function isUserActive(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true },
    });

    if (!user) return false;

    if (!user.lastActiveAt) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return user.lastActiveAt > fiveMinutesAgo;
  } catch (error) {
    console.error("Error checking user activity:", error);
    return false;
  }
}

export async function sendImmediateMessageEmail(
  messageId: string,
  conversationId: string,
  senderId: string,
  recipientId: string,
  messageText: string
): Promise<boolean> {
  try {
    const [recipient, sender] = await Promise.all([
      prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true, name: true, emailNotifications: true },
      }),
      prisma.member.findUnique({
        where: { userId: senderId },
        select: { name: true, gender: true },
      }),
    ]);

    if (!recipient?.email || !sender?.name) {
      console.log("Recipient email or sender name not found");
      return false;
    }

    const emailSettings = recipient.emailNotifications as any;
    const newMessageEnabled = emailSettings?.newMessage ?? true;
    if (!newMessageEnabled) {
      console.log(
        `User ${recipientId} has disabled message email notifications`
      );
      return false;
    }

    const userIsActive = await isUserActive(recipientId);
    if (userIsActive) {
      console.log(`User ${recipientId} is currently active, skipping email`);
      return false;
    }

    const lastEmailSent = conversationEmailTracker.get(conversationId);
    if (lastEmailSent) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (lastEmailSent > oneHourAgo) {
        const minutesAgo = Math.floor(
          (Date.now() - lastEmailSent.getTime()) / 60000
        );
        console.log(
          `Email already sent for conversation ${conversationId} ${minutesAgo} minutes ago, skipping`
        );
        return false;
      }
    }

    const messagePreview =
      messageText.length > 50 ? messageText.substring(0, 50) : messageText;

    await sendNewMessageEmail(
      recipient.email,
      recipient.name || "משתמש",
      sender.name,
      messagePreview,
      senderId,
      sender.gender
    );

    conversationEmailTracker.set(conversationId, new Date());
    console.log(`✅ Immediate email sent for message ${messageId}`);

    return true;
  } catch (error) {
    console.error("Error sending immediate message email:", error);
    return false;
  }
}

export async function scheduleReminderEmail(
  messageId: string,
  conversationId: string,
  recipientId: string,
  delayHours: number = 2
): Promise<void> {
  try {
    const existingTimeout = scheduledReminderEmails.get(messageId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      scheduledReminderEmails.delete(messageId);
    }

    const timeout = setTimeout(
      async () => {
        try {
          console.log(
            `Checking if reminder email should be sent for message ${messageId}...`
          );

          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: {
              id: true,
              text: true,
              dateRead: true,
              senderId: true,
              recipientId: true,
              sender: {
                select: {
                  name: true,
                  gender: true,
                },
              },
            },
          });

          if (!message) {
            console.log(`Message ${messageId} not found, skipping reminder`);
            return;
          }

          if (message.dateRead) {
            console.log(
              `Message ${messageId} has been read, skipping reminder`
            );
            return;
          }

          const userStillInactive = !(await isUserActive(recipientId));
          if (!userStillInactive) {
            console.log(`User ${recipientId} is now active, skipping reminder`);
            return;
          }

          const unreadCount = await prisma.message.count({
            where: {
              senderId: message.senderId,
              recipientId: recipientId,
              dateRead: null,
              recipientDeleted: false,
            },
          });

          console.log(
            `Found ${unreadCount} unread message(s) for reminder email`
          );

          const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            select: {
              email: true,
              name: true,
            },
          });

          if (!recipient?.email) {
            console.log(`Recipient ${recipientId} email not found, skipping`);
            return;
          }

          const messagePreview =
            message.text.length > 50
              ? message.text.substring(0, 50)
              : message.text;

          console.log(
            `Sending reminder email to ${recipient.email} for message ${messageId}`
          );

          await sendNewMessageEmail(
            recipient.email,
            recipient.name || "משתמש",
            message.sender?.name || "משתמש",
            messagePreview,
            message.senderId || "",
            message.sender?.gender
          );

          console.log(
            `✅ Reminder email sent successfully for message ${messageId}`
          );
        } catch (error) {
          console.error(
            `Error sending reminder email for message ${messageId}:`,
            error
          );
        } finally {
          scheduledReminderEmails.delete(messageId);
        }
      },
      delayHours * 60 * 60 * 1000
    );

    scheduledReminderEmails.set(messageId, timeout);

    console.log(
      `📧 Reminder email scheduled for message ${messageId} in ${delayHours} hour(s)`
    );
  } catch (error) {
    console.error("Error scheduling reminder email:", error);
  }
}

export async function cancelReminderEmail(messageId: string): Promise<void> {
  const timeout = scheduledReminderEmails.get(messageId);
  if (timeout) {
    clearTimeout(timeout);
    scheduledReminderEmails.delete(messageId);
    console.log(`Cancelled reminder email for message ${messageId}`);
  }
}

export async function getLastEmailSentTime(
  conversationId: string
): Promise<Date | undefined> {
  return conversationEmailTracker.get(conversationId);
}

export async function cleanupOldTracking(): Promise<void> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let cleaned = 0;

  for (const [conversationId, lastSent] of conversationEmailTracker.entries()) {
    if (lastSent < twentyFourHoursAgo) {
      conversationEmailTracker.delete(conversationId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} old conversation tracking entries`);
  }
}

export async function updateUserActivity(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    console.error("Error updating user activity:", error);
  }
}
