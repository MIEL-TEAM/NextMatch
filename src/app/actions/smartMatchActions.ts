"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { PaginatedResponse } from "@/types";
import { Member } from "@prisma/client";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function trackUserInteraction(
  targetUserId: string,
  action: string,
  duration?: number
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return null;

    let weight = 1.0;
    switch (action) {
      case "view":
        weight = 0.5 + (duration ? Math.min(duration / 60, 5) * 0.1 : 0);
        break;
      case "like":
        weight = 2.0;
        break;
      case "message":
        weight = 3.0;
        break;
      case "profile_click":
        weight = 1.5;
        break;
      default:
        weight = 1.0;
    }

    const interaction = await prisma.userInteraction.create({
      data: {
        userId,
        targetId: targetUserId,
        action,
        duration,
        weight,
      },
    });

    return interaction;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error tracking user interaction:", error);
    }
    return null;
  }
}

export async function getSmartMatches(
  pageNumber = "1",
  pageSize = "12"
): Promise<PaginatedResponse<Member & { matchReason?: string }>> {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { items: [], totalCount: 0 };

    const page = parseInt(pageNumber);
    const limit = parseInt(pageSize);
    const skip = (page - 1) * limit;

    const [interactions, likedUserIds, messagedUserIds] = await Promise.all([
      prisma.userInteraction.findMany({
        where: { userId },
        select: { targetId: true },
        orderBy: { timestamp: "desc" },
        take: 50,
      }),
      prisma.like.findMany({
        where: { sourceUserId: userId },
        select: { targetUserId: true },
        take: 50,
      }),
      prisma.message.findMany({
        where: { senderId: userId },
        select: { recipientId: true },
        orderBy: { created: "desc" },
        take: 50,
      }),
    ]);

    const interactedUserIds = [
      ...interactions.map((i) => i.targetId),
      ...likedUserIds.map((l) => l.targetUserId),
      ...messagedUserIds.map((m) => m.recipientId),
    ].filter(Boolean) as string[];

    if (interactedUserIds.length === 0) {
      return { items: [], totalCount: 0 };
    }

    const uniqueUserIds = Array.from(new Set(interactedUserIds));

    const members = await prisma.member.findMany({
      where: {
        userId: { in: uniqueUserIds },
      },
      include: {
        interests: true,
      },
      orderBy: { updated: "desc" },
      skip,
      take: limit,
    });

    const userProfileAnalysis = await prisma.userProfileAnalysis.findUnique({
      where: { userId },
    });

    if (!userProfileAnalysis?.content) {
      return {
        items: members,
        totalCount: uniqueUserIds.length,
      };
    }

    const candidateSummary = members.map((m) => ({
      userId: m.userId,
      name: m.name,
      age: m.dateOfBirth,
      city: m.city,
      interests: m.interests?.map((i) => i.name),
    }));

    const gptPrompt = `
        המשתמש מתואר כך:
        ${userProfileAnalysis.content}

        עכשיו תנתח את המועמדים:
        ${JSON.stringify(candidateSummary)}

        החזר רק JSON חוקי, ללא הסברים נוספים, בדיוק בפורמט הבא:
        [
          { "userId": "abc123", "score": 9, "matchReason": "תחומי עניין דומים: ..." }
        ]
      `;

    let gptMatches: { userId: string; score: number; matchReason: string }[] =
      [];

    try {
      const completion = await openai.chat.completions
        .create({
          model: "gpt-4o",
          messages: [{ role: "user", content: gptPrompt }],
        })
        .catch((error) => {
          console.error("OpenAI API Error in getSmartMatches:", error);
          return {
            choices: [
              {
                message: {
                  content: "[]",
                },
              },
            ],
          };
        });

      const raw = completion.choices[0].message.content || "[]";
      const firstBrace = raw.indexOf("[");
      const lastBrace = raw.lastIndexOf("]");
      const json = raw.slice(firstBrace, lastBrace + 1);

      gptMatches = JSON.parse(json);
    } catch (error) {
      console.error("❌ GPT דירוג נכשל:", error);
      gptMatches = [];
    }

    const scoreMap = new Map<string, number>();
    const reasonMap = new Map<string, string>();
    gptMatches.forEach((m) => {
      scoreMap.set(m.userId, m.score);
      reasonMap.set(m.userId, m.matchReason);
    });

    const sortedMembers = [...members].sort((a, b) => {
      return (scoreMap.get(b.userId) || 0) - (scoreMap.get(a.userId) || 0);
    });

    return {
      items: sortedMembers.map((m) => ({
        ...m,
        matchReason: reasonMap.get(m.userId) || "",
      })),
      totalCount: uniqueUserIds.length,
    };
  } catch (error) {
    console.error("❌ getSmartMatches error:", error);
    return { items: [], totalCount: 0 };
  }
}

export async function prefetchSmartMatches(pageSize = "12") {
  try {
    await getSmartMatches("1", pageSize);
    await getSmartMatches("2", pageSize);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function getUserLikes(userId: string) {
  const likes = await prisma.like.findMany({
    where: { sourceUserId: userId },
    select: {
      targetUserId: true,
    },
    take: 100,
  });

  const targetIds = likes.map((like) => like.targetUserId);

  if (targetIds.length === 0) return [];

  const users = await prisma.member.findMany({
    where: {
      userId: { in: targetIds },
    },
    select: {
      id: true,
      dateOfBirth: true,
      city: true,
      country: true,
      gender: true,
      description: true,
      interests: {
        select: {
          name: true,
          category: true,
        },
      },
    },
  });

  return users;
}

export async function getUserMessages(userId: string) {
  const messages = await prisma.message.findMany({
    where: { senderId: userId },
    select: {
      text: true,
      created: true,
      recipientId: true,
    },
    orderBy: {
      created: "desc" as const,
    },
    take: 50,
  });

  const recipientIds = messages
    .map((m) => m.recipientId)
    .filter((id): id is string => id !== null);
  const recipients = await prisma.member.findMany({
    where: { userId: { in: recipientIds } },
    select: { userId: true, name: true, gender: true },
  });

  return messages.map((message) => ({
    ...message,
    recipientName:
      recipients.find((r) => r.userId === message.recipientId)?.name || "משתמש",
    recipientGender:
      recipients.find((r) => r.userId === message.recipientId)?.gender ||
      "לא צוין",
  }));
}

export async function getUserInteractions(userId: string) {
  const interactions = await prisma.userInteraction.findMany({
    where: { userId },
    include: {
      target: {
        select: {
          name: true,
          gender: true,
          city: true,
          dateOfBirth: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 100,
  });

  return interactions.map((i) => ({
    targetName: i.target?.name || "משתמש",
    targetGender: i.target?.gender || "לא צוין",
    targetCity: i.target?.city || "לא צוין",
    targetAge: i.target?.dateOfBirth
      ? new Date().getFullYear() - new Date(i.target.dateOfBirth).getFullYear()
      : null,
    duration: i.duration || 0,
    action: i.action,
    timestamp: i.timestamp,
    weight: i.weight || 1.0,
  }));
}
