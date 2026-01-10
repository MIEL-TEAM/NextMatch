import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function dbUpdateUser(
  userId: string,
  data: Prisma.UserUpdateInput
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function dbUpdateMember(
  userId: string,
  data: Prisma.MemberUpdateInput
) {
  return prisma.member.update({
    where: { userId },
    data,
  });
}

export async function dbCreatePhoto(data: {
  url: string;
  publicId: string;
  memberId: string;
}) {
  return prisma.photo.create({
    data: {
      ...data,
      isApproved: false,
    },
  });
}

export async function dbDeletePhoto(photoId: string, userId: string) {
  return prisma.member.update({
    where: { userId },
    data: {
      photos: {
        delete: { id: photoId },
      },
    },
  });
}

export async function dbGetUserForNav(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true },
  });
}

export async function dbGetUserIntroStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { hasSeenMembersIntro: true },
  });
}

export async function dbGetUserWithMemberProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
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
}

// helper function to ensure a member exists for a user
export async function ensureMember(userId: string) {
  return prisma.member.upsert({
    where: { userId },
    create: {
      userId,
      name: "משתמש חדש",
      dateOfBirth: new Date("2000-01-01"),
      gender: "other",
      description: "",
      city: "",
      country: "",
    },
    update: {},
  });
}
