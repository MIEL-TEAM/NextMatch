import { add } from "date-fns";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import { resolvePlan } from "./plan.resolver";

export interface ActivateSubscriptionInput {
  userId: string;
  planId: string;
  provider: string;
  providerSubscriptionId?: string;
  providerToken?: string;
  providerCustomerId?: string;
  currentPeriodEnd?: Date;
  amount?: number;
}

export class SubscriptionService {
  async createPendingSubscription(userId: string, planId: string) {
    return prisma.subscription.create({
      data: {
        userId,
        planId,
        provider: "cardcom",
        status: SubscriptionStatus.PENDING,
      },
    });
  }

  async activateSubscriptionFromWebhook(input: ActivateSubscriptionInput) {
    const plan = resolvePlan(input.planId);
    const currentPeriodEnd =
      input.currentPeriodEnd ?? add(new Date(), { months: plan.months });

    // Normalize empty strings → null so DB stores clean nulls, not ""
    const providerToken = input.providerToken || null;

    return prisma.$transaction(async (tx) => {
      // Idempotency: token-based dedup in production; time-window dedup for sandbox/tokenless
      const alreadyActive = await tx.subscription.findFirst({
        where: providerToken
          ? { userId: input.userId, providerToken, status: SubscriptionStatus.ACTIVE }
          : {
              userId: input.userId,
              planId: input.planId,
              status: SubscriptionStatus.ACTIVE,
              createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
            },
        select: { id: true, userId: true, status: true, currentPeriodEnd: true },
      });
      if (alreadyActive) return alreadyActive;

      const pending = await tx.subscription.findFirst({
        where: { userId: input.userId, status: SubscriptionStatus.PENDING },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      const rowData = {
        status: SubscriptionStatus.ACTIVE,
        provider: input.provider,
        providerSubscriptionId: input.providerSubscriptionId || null,
        providerToken,
        providerCustomerId: input.providerCustomerId || null,
        currentPeriodEnd,
        planId: input.planId,
      };

      const subscription = pending
        ? await tx.subscription.update({
            where: { id: pending.id },
            data: rowData,
          })
        : await tx.subscription.create({
            data: { userId: input.userId, ...rowData },
          });

      await tx.user.update({
        where: { id: input.userId },
        data: {
          isPremium: true,
          premiumUntil: currentPeriodEnd,
          canceledAt: null,
          boostsAvailable: { increment: plan.boosts },
        },
      });

      return subscription;
    });
  }

  async markAsCanceled(subscriptionId: string) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: SubscriptionStatus.CANCELED },
      });

      await tx.user.update({
        where: { id: sub.userId },
        data: { canceledAt: new Date() },
      });

      return sub;
    });
  }

  async markAsPastDue(subscriptionId: string) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: SubscriptionStatus.PAST_DUE },
      });

      await tx.user.update({
        where: { id: sub.userId },
        data: { canceledAt: new Date() },
      });

      return sub;
    });
  }

  async extendSubscription(subscriptionId: string, newPeriodEnd: Date) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodEnd: newPeriodEnd,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      await tx.user.update({
        where: { id: sub.userId },
        data: {
          isPremium: true,
          premiumUntil: newPeriodEnd,
          canceledAt: null,
        },
      });

      return sub;
    });
  }

  async isActive(userId: string): Promise<boolean> {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { gt: new Date() },
      },
      select: { id: true },
    });

    return sub !== null;
  }

  async findByProviderSubscriptionId(providerSubscriptionId: string) {
    return prisma.subscription.findFirst({
      where: { providerSubscriptionId },
      select: { id: true, userId: true, status: true, currentPeriodEnd: true },
    });
  }
}

export const subscriptionService = new SubscriptionService();
