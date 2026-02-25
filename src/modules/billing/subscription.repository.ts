import { prisma } from "@/lib/prisma";
import {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionPlan,
  GrantPremiumInput,
  RenewPremiumInput,
  CancelPremiumInput,
  RevokePremiumInput,
} from "./subscription.types";

const SUBSCRIPTION_SELECT = {
  id: true,
  isPremium: true,
  premiumUntil: true,
  canceledAt: true,
  boostsAvailable: true,
} as const;

type SubscriptionRow = {
  id: string;
  isPremium: boolean;
  premiumUntil: Date | null;
  canceledAt: Date | null;
  boostsAvailable: number;
};

function deriveStatus(row: SubscriptionRow): SubscriptionStatus {
  const now = new Date();
  const until = row.premiumUntil ? new Date(row.premiumUntil) : null;

  if (!row.isPremium && !until) {
    return SubscriptionStatus.NEVER_SUBSCRIBED;
  }

  if (until && until < now) {
    return SubscriptionStatus.EXPIRED;
  }

  if (row.canceledAt) {
    return SubscriptionStatus.CANCELED;
  }

  if (row.isPremium) {
    return SubscriptionStatus.ACTIVE;
  }

  return SubscriptionStatus.EXPIRED;
}

function toSubscriptionState(row: SubscriptionRow): SubscriptionState {
  const status = deriveStatus(row);
  const now = new Date();
  const until = row.premiumUntil ? new Date(row.premiumUntil) : null;

  return {
    userId: row.id,
    status,
    // TODO: persist planId to DB — currently not stored, defaults to POPULAR
    plan: SubscriptionPlan.POPULAR,
    isPremiumActive: row.isPremium && !!until && until > now,
    premiumUntil: row.premiumUntil,
    canceledAt: row.canceledAt,
    boostsAvailable: row.boostsAvailable,
    // Provider IDs live on the Subscription table, not on User
    providerCustomerId: null,
    providerSubscriptionId: null,
  };
}

export async function getSubscriptionState(
  userId: string
): Promise<SubscriptionState | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: SUBSCRIPTION_SELECT,
  });

  return row ? toSubscriptionState(row) : null;
}

export async function getSubscriptionStateByProviderSubscriptionId(
  providerSubscriptionId: string
): Promise<SubscriptionState | null> {
  const sub = await prisma.subscription.findFirst({
    where: { providerSubscriptionId },
    select: { userId: true },
  });

  if (!sub) return null;
  return getSubscriptionState(sub.userId);
}

export async function getSubscriptionStateByProviderCustomerId(
  providerCustomerId: string
): Promise<SubscriptionState | null> {
  const sub = await prisma.subscription.findFirst({
    where: { providerCustomerId },
    select: { userId: true },
  });

  if (!sub) return null;
  return getSubscriptionState(sub.userId);
}

/**
 * Grant premium access after successful checkout.
 */
export async function grantPremium(input: GrantPremiumInput): Promise<void> {
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      isPremium: true,
      premiumUntil: input.premiumUntil,
      boostsAvailable: { increment: input.boostsToAdd },
      canceledAt: null,
    },
  });
}

/**
 * Extend premium to a new period end date on subscription renewal.
 */
export async function renewPremium(input: RenewPremiumInput): Promise<void> {
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      isPremium: true,
      premiumUntil: input.premiumUntil,
      canceledAt: null,
    },
  });
}

/**
 * Mark subscription as scheduled for cancellation.
 */
export async function markCanceled(input: CancelPremiumInput): Promise<void> {
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      canceledAt: new Date(),
      premiumUntil: input.premiumUntil,
    },
  });
}

/**
 * Revoke premium access immediately.
 */
export async function revokePremium(input: RevokePremiumInput): Promise<void> {
  await prisma.user.update({
    where: { id: input.userId },
    data: {
      isPremium: false,
      canceledAt: new Date(),
    },
  });
}

/**
 * Clear the stored provider subscription ID after deletion.
 */
export async function clearProviderSubscriptionId(userId: string): Promise<void> {
  await prisma.subscription.updateMany({
    where: { userId },
    data: { providerSubscriptionId: null },
  });
}
