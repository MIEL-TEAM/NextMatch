"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { uploadVideoToS3 } from "@/lib/video-upload";
import { cache } from "react";
import { Video } from "@prisma/client";

interface VideoUploadResult {
  success: boolean;
  video?: Video;
  error?: string;
}

export async function uploadVideo(
  formData: FormData
): Promise<VideoUploadResult> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      throw new Error("לא מורשה");
    }

    const file = formData.get("file") as File | null;
    const memberId = formData.get("memberId") as string | null;

    if (!file || !memberId) {
      throw new Error("נדרשים קובץ וזיהוי חבר");
    }

    const fileSize = file.size;
    const fileType = file.type;

    const maxSize = 100 * 1024 * 1024;
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

    if (fileSize > maxSize) {
      throw new Error("גודל הקובץ חורג מהמגבלה המותרת");
    }

    if (!allowedTypes.includes(fileType)) {
      throw new Error("סוג קובץ לא תקין. רק קבצי MP4, MOV ו-AVI נתמכים");
    }

    const videoUrl = await uploadVideoToS3(file, userId);

    const video = await prisma.video.create({
      data: {
        url: videoUrl,
        memberId,
        duration: 0,
        isApproved: true,
      },
    });

    return { success: true, video };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "שגיאה לא ידועה";
    return { success: false, error: errorMessage };
  }
}

export async function getMemberVideos(memberId: string): Promise<Video[]> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      throw new Error("לא מורשה");
    }

    const videos = await prisma.video.findMany({
      where: {
        memberId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return videos;
  } catch {
    return [];
  }
}

export const getMemberVideosForCards = cache(
  async (
    memberIds: string[]
  ): Promise<Record<string, Array<{ id: string; url: string }>>> => {
    try {
      const userId = await getAuthUserId();
      if (!userId) {
        throw new Error("לא מורשה");
      }

      if (!memberIds.length) {
        return {};
      }

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
