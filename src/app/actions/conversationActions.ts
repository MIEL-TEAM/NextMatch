"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/session";

export async function getRecentConversations(limit: number = 5) {
  try {
    const userId = await getAuthUserId();

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, senderDeleted: false },
          { recipientId: userId, recipientDeleted: false },
        ],
      },
      orderBy: {
        created: "desc",
      },
      include: {
        sender: {
          select: {
            userId: true,
            name: true,
            image: true,
            user: {
              select: {
                lastActiveAt: true,
              },
            },
          },
        },
        recipient: {
          select: {
            userId: true,
            name: true,
            image: true,
            user: {
              select: {
                lastActiveAt: true,
              },
            },
          },
        },
      },
    });

    // Group by conversation partner and get the latest message for each
    const conversationsMap = new Map();

    for (const message of recentMessages) {
      const otherUserId =
        message.senderId === userId ? message.recipientId : message.senderId;

      if (!otherUserId || conversationsMap.has(otherUserId)) continue;

      const otherUser =
        message.senderId === userId ? message.recipient : message.sender;

      if (!otherUser) continue;

      // Count unread messages from this user
      const unreadCount = await prisma.message.count({
        where: {
          senderId: otherUserId,
          recipientId: userId,
          dateRead: null,
          recipientDeleted: false,
        },
      });

      conversationsMap.set(otherUserId, {
        userId: otherUser.userId,
        name: otherUser.name,
        image: otherUser.image,
        lastMessage: message.text,
        lastMessageDate: message.created,
        unreadCount,
        isOnline: otherUser.user?.lastActiveAt
          ? new Date().getTime() -
          new Date(otherUser.user.lastActiveAt).getTime() <
          5 * 60 * 1000
          : false,
      });

      if (conversationsMap.size >= limit) break;
    }

    return {
      success: true,
      conversations: Array.from(conversationsMap.values()),
    };
  } catch (error) {
    console.error("Error fetching recent conversations:", error);
    return {
      success: false,
      conversations: [],
    };
  }
}
