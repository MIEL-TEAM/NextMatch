import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function dbGetUserPremiumStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPremium: true,
      premiumUntil: true,
      boostsAvailable: true,
      canceledAt: true,
    },
  });
}

export async function dbGetUserForBoost(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isPremium: true,
      boostsAvailable: true,
    },
  });
}

export async function dbUpdateUserBoost(
  userId: string,
  boostsToUse: number,
  boostEndTime: Date
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      boostsAvailable: { decrement: boostsToUse },
      member: {
        update: { boostedUntil: boostEndTime },
      },
    },
    select: {
      boostsAvailable: true,
      member: {
        select: { boostedUntil: true },
      },
    },
  });
}

export async function dbGetLatestSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { planId: true, status: true },
  });
}

export async function dbGetActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [
          SubscriptionStatus.PENDING,
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.CANCELED,
          SubscriptionStatus.PAST_DUE,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      planId: true,
      status: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
  });
}

export async function dbUpdateUserPremiumActivation(
  userId: string,
  data: {
    isPremium: boolean;
    premiumUntil: Date;
    boostsAvailable: number;
    canceledAt: null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      isPremium: true,
      premiumUntil: true,
      boostsAvailable: true,
    },
  });
}
