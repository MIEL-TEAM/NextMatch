import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function dbGetMemberByUserId(userId: string) {
  return prisma.member.findUnique({
    where: {
      userId: userId,
    },
  });
}

export async function dbGetInterestsByMemberId(memberId: string) {
  return prisma.interest.findMany({
    where: {
      memberId: memberId,
    },
  });
}

export async function dbDeleteInterestsByMemberId(memberId: string) {
  return prisma.interest.deleteMany({
    where: {
      memberId: memberId,
    },
  });
}

export async function dbCreateInterests(
  data: Prisma.InterestCreateManyInput[]
) {
  return prisma.interest.createMany({
    data: data,
  });
}

export async function dbUpdateUserProfileComplete(
  userId: string,
  profileComplete: boolean
) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profileComplete: profileComplete,
    },
  });
}

export async function dbCountInterestsByMemberId(memberId: string) {
  return prisma.interest.count({
    where: {
      memberId: memberId,
    },
  });
}

export async function dbCreateInterest(
  data: Prisma.InterestUncheckedCreateInput
) {
  return prisma.interest.create({
    data,
  });
}

export async function dbFindInterest(interestId: string, memberId: string) {
  return prisma.interest.findFirst({
    where: {
      id: interestId,
      memberId: memberId,
    },
  });
}

export async function dbDeleteInterest(interestId: string) {
  return prisma.interest.delete({
    where: {
      id: interestId,
    },
  });
}
