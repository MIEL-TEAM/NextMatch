"use server";

import { prisma } from "@/lib/prisma";
import { Video } from "@prisma/client";
import { cache } from "react";

export async function getMemberVideos(memberId: string): Promise<Video[]> {
  try {
    return await prisma.video.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export const getMemberVideosForCards = cache(
  async (
    memberIds: string[]
  ): Promise<Record<string, Array<{ id: string; url: string }>>> => {
    try {
      if (!memberIds.length) return {};

      const videos = await prisma.video.findMany({
        where: {
          member: {
            userId: {
              in: memberIds,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          member: {
            select: {
              userId: true,
            },
          },
        },
      });

      const videosByMemberId: Record<
        string,
        Array<{ id: string; url: string }>
      > = Object.fromEntries(memberIds.map((id) => [id, []]));

      for (const video of videos) {
        const userId = video.member.userId;
        if (!videosByMemberId[userId]) continue;

        if (videosByMemberId[userId].length < 3) {
          videosByMemberId[userId].push({
            id: video.id,
            url: video.url,
          });
        }
      }

      return videosByMemberId;
    } catch {
      return {};
    }
  }
);
