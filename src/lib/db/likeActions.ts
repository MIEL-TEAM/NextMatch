import { prisma } from "@/lib/prisma";

export async function dbDeleteLike(userId: string, targetUserId: string) {
  return prisma.like.delete({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: userId,
        targetUserId,
      },
    },
  });
}

export async function dbCreateLike(userId: string, targetUserId: string) {
  return prisma.like.create({
    data: {
      sourceUserId: userId,
      targetUserId,
    },
    select: {
      sourceMember: {
        select: {
          name: true,
          image: true,
          userId: true,
        },
      },
      targetMember: {
        select: {
          city: true,
          interests: {
            select: { name: true },
            take: 1,
          },
        },
      },
    },
  });
}

export async function dbGetMutualLike(userId: string, targetUserId: string) {
  return prisma.like.findUnique({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId: targetUserId,
        targetUserId: userId,
      },
    },
  });
}

export async function dbGetMemberGender(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: { gender: true },
  });
}

export async function dbGetMemberNameImage(userId: string) {
  return prisma.member.findUnique({
    where: { userId },
    select: { name: true, image: true },
  });
}

export async function dbGetUserEmailName(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
}

export async function dbGetLikeIds(userId: string) {
  return prisma.like.findMany({
    where: {
      sourceUserId: userId,
    },
    select: {
      targetUserId: true,
    },
  });
}

export async function dbGetSourceLikes(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });
}

export async function dbGetTargetLikes(userId: string) {
  return prisma.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });
}

export async function dbGetLikedUserIds(userId: string) {
  return prisma.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
}

export async function dbGetMutualLikesList(userId: string, likeIds: string[]) {
  return prisma.like.findMany({
    where: {
      AND: [
        {
          targetUserId: userId,
        },
        { sourceUserId: { in: likeIds } },
      ],
    },
    select: { sourceMember: true },
  });
}
