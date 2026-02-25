import { add } from "date-fns";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import { resolvePlan } from "./plan.resolver";
import { subscriptionService } from "./SubscriptionService";
import { cardcomProvider } from "./providers/cardcom.provider";

export interface RenewalJobResult {
  processed: number;
  succeeded: number;
  failed: number;
}

export async function runRenewalJob(): Promise<RenewalJobResult> {
  const now = new Date();

  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: { lte: now },
      provider: "cardcom",
      providerToken: { not: null },
    },
    select: {
      id: true,
      userId: true,
      planId: true,
      currentPeriodEnd: true,
      providerToken: true,
    },
  });

  let succeeded = 0;
  let failed = 0;

  for (const sub of expiredSubs) {
    if (!sub.providerToken || !sub.currentPeriodEnd) {
      console.error(
        `[renewal.job] Subscription ${sub.id} missing token or period end — skipping`
      );
      failed++;
      continue;
    }

    try {
      const plan = resolvePlan(sub.planId);
      const idempotencyKey = `miel-renewal-${sub.id}-${Date.now()}`;

      const result = await cardcomProvider.chargeToken(
        sub.providerToken,
        plan.amount,
        idempotencyKey
      );

      if (result.success) {
        const newPeriodEnd = add(sub.currentPeriodEnd, { months: plan.months });
        await subscriptionService.extendSubscription(sub.id, newPeriodEnd);
        succeeded++;
      } else {
        console.warn(
          `[renewal.job] Charge declined for subscription ${sub.id} (userId: ${sub.userId}) — code ${result.responseCode}`
        );
        await subscriptionService.markAsPastDue(sub.id);
        failed++;
      }
    } catch (err) {
      console.error(
        `[renewal.job] Unhandled error for subscription ${sub.id} (userId: ${sub.userId}):`,
        err
      );
      failed++;
    }
  }

  return { processed: expiredSubs.length, succeeded, failed };
}
