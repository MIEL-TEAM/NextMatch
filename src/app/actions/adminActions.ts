"use server";

import { prisma } from "@/lib/prisma";
import { getUserRole, getSession } from "@/lib/session";
import { Photo } from "@prisma/client";
import { cloudinary } from "@/lib/cloudinary";

// ✅ Admin audit log helper
async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>
) {
  const session = await getSession();
  if (!session?.user?.id) return;

  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

export async function getUnapprovedPhotos() {
  try {
    const role = await getUserRole();
    if (role !== "ADMIN") throw new Error("Forbidden");

    return prisma.photo.findMany({
      where: {
        isApproved: false,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function approvePhoto(photoId: string) {
  try {
    const role = await getUserRole();

    if (role !== "ADMIN") throw new Error("Forbidden");

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { member: { include: { user: true } } },
    });

    if (!photo || !photo.member || !photo.member.user)
      throw new Error("Cannot approve that image");

    const { member } = photo;

    const userUpdate =
      member.user && member.user.image === null ? { image: photo.url } : {};
    const memberUpdate = member.image === null ? { image: photo.url } : {};

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: member.userId },
        data: userUpdate,
      });
    }

    const result = await prisma.member.update({
      where: { id: member.id },
      data: {
        ...memberUpdate,
        photos: {
          update: { where: { id: photo.id }, data: { isApproved: true } },
        },
      },
    });

    // ✅ Log admin action
    await logAdminAction("APPROVE_PHOTO", "Photo", photoId, {
      userId: member.userId,
      userName: member.name,
      photoUrl: photo.url,
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function rejectPhoto(photo: Photo) {
  try {
    const role = await getUserRole();

    if (role !== "ADMIN") throw new Error("Forbidden");

    if (photo.publicId) {
      await cloudinary.v2.uploader.destroy(photo.publicId);
    }

    const result = await prisma.photo.delete({
      where: { id: photo.id },
    });

    // ✅ Log admin action
    await logAdminAction("REJECT_PHOTO", "Photo", photo.id, {
      photoUrl: photo.url,
      publicId: photo.publicId,
    });

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
