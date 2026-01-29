import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function dbGetUserPreferences(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredGenders: true,
      preferredAgeMin: true,
      preferredAgeMax: true,
    },
  });
}

export async function dbGetMemberLocation(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: { latitude: true, longitude: true, locationEnabled: true },
  });
}

export async function dbGetMembersWithDistance(
  whereClause: Prisma.MemberWhereInput,
  selectFields: Prisma.MemberSelect,
) {
  return prisma.member.findMany({
    where: whereClause,
    select: selectFields,
  });
}

export async function dbGetMembersWithPagination(
  whereClause: Prisma.MemberWhereInput,
  selectFields: Prisma.MemberSelect,
  orderByField: string,
  orderDirection: "asc" | "desc",
  skip: number,
  limit: number,
) {
  return Promise.all([
    prisma.member.count({
      where: whereClause,
    }),
    prisma.member.findMany({
      where: whereClause,
      select: selectFields,
      orderBy: { [orderByField]: orderDirection },
      skip: skip,
      take: limit,
    }),
  ]);
}

export async function dbUpdateMemberLocation(
  userId: string,
  data: Prisma.MemberUpdateInput,
) {
  return prisma.member.update({
    where: { userId },
    data,
    select: {
      userId: true,
      latitude: true,
      longitude: true,
      locationEnabled: true,
    },
  });
}

export async function dbGetMemberLocationStatus(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: {
      latitude: true,
      longitude: true,
      locationEnabled: true,
      locationUpdatedAt: true,
    },
  });
}

export async function dbGetPhotosWithMembers(
  memberIds: string[],
  currentUserId: string | null,
) {
  return prisma.photo.findMany({
    where: {
      member: {
        userId: { in: memberIds },
      },
      ...(currentUserId && !memberIds.includes(currentUserId)
        ? { isApproved: true }
        : {}),
    },
    include: {
      member: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: { isApproved: "desc" },
  });
}

export async function dbGetMemberByUserId(userId: string) {
  return prisma.member.findUnique({
    where: {
      userId: userId,
    },
    select: {
      // Core member fields
      id: true,
      userId: true,
      name: true,
      dateOfBirth: true,
      gender: true,
      created: true,
      updated: true,
      description: true,
      city: true,
      country: true,
      image: true,
      coverImage: true,
      coverImagePublicId: true,
      boostedUntil: true,
      videoUrl: true,
      videoUploadedAt: true,

      // Location fields
      latitude: true,
      longitude: true,
      locationUpdatedAt: true,
      locationEnabled: true,
      maxDistance: true,

      // User relation (only needed fields)
      user: {
        select: {
          emailVerified: true,
          oauthVerified: true,
          lastActiveAt: true,
        },
      },
    },
  });
}

export async function dbGetMemberPhotos(
  userId: string,
  isSelf: boolean = false,
) {
  return prisma.member.findUnique({
    where: { userId },
    select: {
      photos: {
        where: isSelf ? {} : { isApproved: true },
        orderBy: {
          isApproved: "desc",
        },
      },
    },
  });
}

export async function dbUpdateLastActive(userId: string) {
  return Promise.all([
    prisma.member.update({
      where: { userId },
      data: { updated: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    }),
  ]);
}

export async function dbGetAllMemberPhotos(userId: string) {
  return prisma.photo.findMany({
    where: {
      member: {
        userId: userId,
      },
    },
    orderBy: {
      isApproved: "desc",
    },
  });
}

export async function dbUpdateUserActivity(userId: string) {
  return prisma.member.update({
    where: { userId },
    data: { updated: new Date() },
  });
}
