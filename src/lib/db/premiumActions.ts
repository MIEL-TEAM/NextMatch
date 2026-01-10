import { prisma } from "@/lib/prisma";

export async function dbGetUserForPremiumUpdate(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isPremium: true,
      premiumUntil: true,
      boostsAvailable: true,
    },
  });
}

export async function dbUpdateUserPremiumStatus(
  userId: string,
  data: {
    isPremium: boolean;
    premiumUntil: Date;
    boostsAvailable: { increment: number };
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    canceledAt?: null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function dbGetUserPremiumStatus(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isPremium: true,
      premiumUntil: true,
      boostsAvailable: true,
      canceledAt: true,
      stripeSubscriptionId: true,
    },
  });
}

export async function dbUpdateUserPremiumStatusSimple(
  userId: string,
  data: { isPremium: boolean; canceledAt?: Date }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function dbGetUserForCancellation(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
}

export async function dbGetUserForSubscriptionReturn(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
    },
  });
}

export async function dbUpdateUserCancellation(
  userId: string,
  data: { canceledAt: Date; premiumUntil: Date }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function dbGetUserForDirectCancellation(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      isPremium: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      premiumUntil: true,
    },
  });
}

export async function dbUpdateUserDirectCancellation(
  userId: string,
  canceledAt: Date
) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      canceledAt,
    },
    select: {
      id: true,
      email: true,
      isPremium: true,
      canceledAt: true,
      premiumUntil: true,
    },
  });
}

export async function dbGetUserForBillingPortal(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      stripeCustomerId: true,
    },
  });
}

export async function dbGetUserForReactivation(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      canceledAt: true,
    },
  });
}

export async function dbGetUserForSubscriptionCheck(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionId: true,
      isPremium: true,
      canceledAt: true,
    },
  });
}

export async function dbUpdateUserSubscriptionStatus(
  userId: string,
  data: {
    isPremium?: boolean;
    canceledAt?: Date | null;
    premiumUntil?: Date | null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function dbGetUserForBoost(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
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
    where: {
      id: userId,
    },
    data: {
      boostsAvailable: {
        decrement: boostsToUse,
      },
      member: {
        update: {
          boostedUntil: boostEndTime,
        },
      },
    },
    select: {
      boostsAvailable: true,
      member: {
        select: {
          boostedUntil: true,
        },
      },
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
