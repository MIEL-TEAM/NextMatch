import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function dbUpdateUserWelcomeStatus(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { hasSeenWelcomeMessage: true },
  });
}

export async function dbGetUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { member: { select: { gender: true } } },
  });
}

export async function dbCreateUserWithMember(userData: Prisma.UserCreateInput) {
  return prisma.user.create({
    data: userData,
    include: {
      member: {
        select: {
          id: true,
          name: true,
          created: true,
        },
      },
    },
  });
}

export async function dbGetUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function dbUpdateUserEmailVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
}

export async function dbDeleteToken(tokenId: string) {
  return prisma.token.delete({ where: { id: tokenId } });
}

export async function dbUpdateUserPassword(
  userId: string,
  passwordHash: string
) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function dbGetUserForSocialProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      oauthVerified: true,
      image: true,
    },
  });
}

export async function dbUpdateUserSocialProfile(
  userId: string,
  userUpdateData: Prisma.UserUpdateInput,
  memberCreateData: Prisma.MemberCreateWithoutUserInput,
  memberUpdateData: Prisma.MemberUpdateInput
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...userUpdateData,
      member: {
        upsert: {
          create: memberCreateData,
          update: memberUpdateData,
        },
      },
    },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
      member: {
        select: {
          id: true,
          name: true,
          created: true,
          image: true,
        },
      },
    },
  });
}

export async function dbSetProfileIncomplete(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profileComplete: false,
    },
  });
}
