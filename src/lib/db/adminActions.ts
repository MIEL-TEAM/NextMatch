import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function dbLogAdminAction(data: Prisma.AdminAuditLogCreateInput) {
  return prisma.adminAuditLog.create({
    data,
  });
}

export async function dbGetUnapprovedPhotos() {
  return prisma.photo.findMany({
    where: {
      isApproved: false,
    },
  });
}

export async function dbGetPhotoForApproval(photoId: string) {
  return prisma.photo.findUnique({
    where: { id: photoId },
    include: { member: { include: { user: true } } },
  });
}

export async function dbUpdateUserImage(userId: string, imageUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl },
  });
}

export async function dbApprovePhoto(
  memberId: string,
  photoId: string,
  memberUpdateData: Prisma.MemberUpdateInput
) {
  return prisma.member.update({
    where: { id: memberId },
    data: {
      ...memberUpdateData,
      photos: {
        update: { where: { id: photoId }, data: { isApproved: true } },
      },
    },
  });
}

export async function dbDeletePhoto(photoId: string) {
  return prisma.photo.delete({
    where: { id: photoId },
  });
}
