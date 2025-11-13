"use server";

import {
  memberEditSchema,
  MemberEditSchema,
} from "@/lib/schemas/memberEditSchema";
import { ActionResult } from "@/types";
import { Photo } from "@prisma/client";
import { getAuthUserId } from "./authActions";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { ensureMember } from "@/lib/prismaHelpers";

export type ProfileCompletionKey =
  | "profileBasics"
  | "bio"
  | "mainPhoto"
  | "gallery"
  | "interests"
  | "video"
  | "location";

export type ProfileCompletionTask = {
  key: ProfileCompletionKey;
  label: string;
  description: string;
  actionHref: string;
  weight: number;
  progress: number;
  completed: boolean;
  meta?: Record<string, string | number | boolean | string[]>;
};

export type ProfileCompletionStatus = {
  completionPercentage: number;
  tasks: ProfileCompletionTask[];
  recommendedAction: ProfileCompletionTask | null;
};

export async function updateMemberProfile(
  data: MemberEditSchema,
  nameUpdated: boolean
): Promise<ActionResult<any>> {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    const validate = memberEditSchema.safeParse(data);
    if (!validate.success) {
      return { status: "error", error: validate.error.errors };
    }

    const { name, description, city, country } = validate.data;

    if (nameUpdated) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    const member = await prisma.member.update({
      where: { userId },
      data: { name, description, city, country },
    });

    return { status: "success", data: member };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "something went wrong" };
  }
}

export async function addImage(url: string, publicId: string) {
  try {
    const userId = await getAuthUserId();
    const member = await ensureMember(userId);

    return prisma.photo.create({
      data: {
        url,
        publicId,
        isApproved: false,
        memberId: member.id,
      },
    });
  } catch (error) {
    console.log("❌ שגיאה בהעלאת תמונה:", error);
    throw error;
  }
}

export async function setMainImage(photo: Photo) {
  if (!photo.isApproved) {
    throw new Error("רק תמונות מאושרות יכולות להיות מוגדרות כתמונה ראשית");
  }
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    await prisma.user.update({
      where: { id: userId },
      data: { image: photo.url },
    });

    return prisma.member.update({
      where: { userId },
      data: { image: photo.url },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfoForNav() {
  try {
    const userId = await getAuthUserId();
    return prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const PROFILE_COMPLETION_TARGETS = {
  bioLength: 120,
  galleryPhotos: 3,
  interests: 5,
} as const;

const PROFILE_COMPLETION_WEIGHTS: Record<ProfileCompletionKey, number> = {
  profileBasics: 20,
  bio: 15,
  mainPhoto: 20,
  gallery: 15,
  interests: 20,
  video: 5,
  location: 5,
};

export async function getProfileCompletionStatus(
  userIdOverride?: string
): Promise<ProfileCompletionStatus | null> {
  try {
    const resolvedUserId = userIdOverride ?? (await getAuthUserId());
    if (!resolvedUserId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: {
        id: true,
        name: true,
        member: {
          select: {
            userId: true,
            name: true,
            description: true,
            city: true,
            country: true,
            gender: true,
            dateOfBirth: true,
            image: true,
            latitude: true,
            longitude: true,
            locationEnabled: true,
            videoUrl: true,
            photos: {
              select: { id: true, isApproved: true },
            },
            interests: {
              select: { id: true },
            },
            videos: {
              select: { id: true, isApproved: true },
            },
          },
        },
      },
    });

    if (!user || !user.member) {
      return null;
    }

    const { member } = user;

    const approvedPhotos = member.photos.filter((photo) => photo.isApproved);
    const approvedPhotoCount = approvedPhotos.length;
    const pendingPhotoCount = member.photos.length - approvedPhotoCount;
    const galleryProgress = Math.min(
      approvedPhotoCount / PROFILE_COMPLETION_TARGETS.galleryPhotos,
      1
    );
    const mainPhotoProgress =
      approvedPhotoCount > 0 || Boolean(member.image)
        ? 1
        : pendingPhotoCount > 0
          ? 0.6
          : 0;

    const interestCount = member.interests.length;
    const interestsProgress = Math.min(
      interestCount / PROFILE_COMPLETION_TARGETS.interests,
      1
    );

    const descriptionLength = member.description?.trim().length ?? 0;
    const bioProgress = Math.min(
      descriptionLength / PROFILE_COMPLETION_TARGETS.bioLength,
      1
    );

    const basicFields = [
      { label: "שם", value: user.name },
      { label: "תיאור", value: member.description },
      { label: "עיר", value: member.city },
      { label: "מדינה", value: member.country },
      { label: "מגדר", value: member.gender },
      { label: "תאריך לידה", value: member.dateOfBirth },
    ];

    const missingBasics = basicFields
      .filter((field) => {
        if (field.value instanceof Date) {
          return !field.value;
        }
        if (typeof field.value === "string") {
          return field.value.trim().length === 0;
        }
        return !field.value;
      })
      .map((field) => field.label);

    const essentialsProgress =
      (basicFields.length - missingBasics.length) / basicFields.length;

    const hasVideo =
      Boolean(member.videoUrl) ||
      member.videos.some((video) => video.isApproved);

    const hasLocation =
      member.locationEnabled &&
      typeof member.latitude === "number" &&
      typeof member.longitude === "number";

    const tasks: ProfileCompletionTask[] = [
      {
        key: "profileBasics",
        label: "פרטי פרופיל בסיסיים",
        description:
          missingBasics.length === 0
            ? "כל הפרטים הבסיסיים מלאים."
            : `חסרים: ${missingBasics.join(", ")}`,
        actionHref: "/members/edit",
        weight: PROFILE_COMPLETION_WEIGHTS.profileBasics,
        progress: essentialsProgress,
        completed: missingBasics.length === 0,
        meta: { missingBasics },
      },
      {
        key: "bio",
        label: "תיאור אישי",
        description:
          descriptionLength >= PROFILE_COMPLETION_TARGETS.bioLength
            ? "הטקסט שלך נראה מצוין."
            : `הוסף עוד ${Math.max(0, PROFILE_COMPLETION_TARGETS.bioLength - descriptionLength)} תווים כדי לספר על עצמך.`,
        actionHref: "/members/edit",
        weight: PROFILE_COMPLETION_WEIGHTS.bio,
        progress: bioProgress,
        completed: descriptionLength >= PROFILE_COMPLETION_TARGETS.bioLength,
        meta: {
          descriptionLength,
          targetLength: PROFILE_COMPLETION_TARGETS.bioLength,
        },
      },
      {
        key: "mainPhoto",
        label: "תמונת פרופיל ראשית",
        description: (() => {
          if (approvedPhotoCount > 0 || member.image) {
            return "יש לך תמונת פרופיל מאושרת.";
          }
          if (pendingPhotoCount > 0) {
            return "התמונה ממתינה לאישור. כדאי להכין תמונה נוספת למקרה שתידחה.";
          }
          return "העלה תמונה ברורה שלך כדי להגדיל חשיפה.";
        })(),
        actionHref: "/members/edit/photos",
        weight: PROFILE_COMPLETION_WEIGHTS.mainPhoto,
        progress: mainPhotoProgress,
        completed: approvedPhotoCount > 0 || Boolean(member.image),
        meta: {
          approvedPhotoCount,
          pendingPhotoCount,
        },
      },
      {
        key: "gallery",
        label: "גלריית תמונות",
        description: (() => {
          const remaining =
            PROFILE_COMPLETION_TARGETS.galleryPhotos - approvedPhotoCount;
          if (remaining <= 0) {
            return "גלריית התמונות שלך מלאה.";
          }
          const pendingNote =
            pendingPhotoCount > 0
              ? ` (${pendingPhotoCount} בהמתנה לאישור)`
              : "";
          return `הוסף עוד ${remaining} תמונות מאושרות${pendingNote}.`;
        })(),
        actionHref: "/members/edit/photos",
        weight: PROFILE_COMPLETION_WEIGHTS.gallery,
        progress: galleryProgress,
        completed:
          approvedPhotoCount >= PROFILE_COMPLETION_TARGETS.galleryPhotos,
        meta: {
          approvedPhotoCount,
          pendingPhotoCount,
          target: PROFILE_COMPLETION_TARGETS.galleryPhotos,
        },
      },
      {
        key: "interests",
        label: "תחומי עניין",
        description:
          interestCount >= PROFILE_COMPLETION_TARGETS.interests
            ? "בחירת תחומי העניין מלאה."
            : `בחר לפחות ${Math.max(0, PROFILE_COMPLETION_TARGETS.interests - interestCount)} תחומי עניין נוספים כדי לעזור לנו להתאים לך אנשים.`,
        actionHref: "/interests",
        weight: PROFILE_COMPLETION_WEIGHTS.interests,
        progress: interestsProgress,
        completed: interestCount >= PROFILE_COMPLETION_TARGETS.interests,
        meta: {
          interestCount,
          target: PROFILE_COMPLETION_TARGETS.interests,
        },
      },
      {
        key: "video",
        label: "וידאו היכרות",
        description: hasVideo
          ? "הסרטון שלך באוויר."
          : "העלה סרטון קצר כדי לבלוט מול משתמשים אחרים.",
        actionHref: `/members/${member.userId}`,
        weight: PROFILE_COMPLETION_WEIGHTS.video,
        progress: hasVideo ? 1 : 0,
        completed: hasVideo,
      },
      {
        key: "location",
        label: "הגדרת מיקום",
        description: hasLocation
          ? "המיקום שלך מעודכן."
          : "אפשר שימוש במיקום כדי לקבל התאמות קרובות אליך.",
        actionHref: "/members?requestLocation=true",
        weight: PROFILE_COMPLETION_WEIGHTS.location,
        progress: hasLocation ? 1 : 0,
        completed: hasLocation,
      },
    ];

    const completionPercentage = Math.round(
      tasks.reduce(
        (total, task) => total + task.weight * Math.min(task.progress, 1),
        0
      )
    );

    const recommendedAction =
      tasks
        .filter((task) => !task.completed)
        .sort(
          (a, b) => b.weight * (1 - b.progress) - a.weight * (1 - a.progress)
        )[0] ?? null;

    return {
      completionPercentage: Math.min(completionPercentage, 100),
      tasks,
      recommendedAction,
    };
  } catch (error) {
    console.error("Failed to calculate profile completion status:", error);
    return null;
  }
}

export async function deleteImage(photo: Photo) {
  try {
    const userId = await getAuthUserId();
    await ensureMember(userId);

    if (photo.publicId) {
      await cloudinary.v2.uploader.destroy(photo.publicId);
    }

    return prisma.member.update({
      where: { userId },
      data: {
        photos: {
          delete: { id: photo.id },
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function markIntroAsSeen(): Promise<ActionResult<boolean>> {
  try {
    const userId = await getAuthUserId();

    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenMembersIntro: true },
    });

    return { status: "success", data: true };
  } catch (error) {
    console.error(error);
    return { status: "error", error: "Something went wrong" };
  }
}

export async function getUserIntroSeen(): Promise<boolean> {
  const userId = await getAuthUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasSeenMembersIntro: true },
  });

  return user?.hasSeenMembersIntro ?? false;
}
