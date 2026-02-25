
import { SubscriptionPlan, PlanConfig } from "./subscription.types";

const PLAN_METADATA: Record<SubscriptionPlan, PlanConfig> = {
  [SubscriptionPlan.FREE]: {
    planId: SubscriptionPlan.FREE,
    months: 0,
    boosts: 0,
    amount: 0,
    displayPrice: "₪0.00 / לחודש",
  },
  [SubscriptionPlan.BASIC]: {
    planId: SubscriptionPlan.BASIC,
    months: 1,
    boosts: 5,
    amount: 29.9,   // 1 × ₪29.90
    displayPrice: "₪29.90 / חודש",
  },
  [SubscriptionPlan.POPULAR]: {
    planId: SubscriptionPlan.POPULAR,
    months: 3,
    boosts: 10,
    amount: 59.7,   // 3 × ₪19.90
    displayPrice: "₪19.90 / לחודש",
  },
  [SubscriptionPlan.ANNUAL]: {
    planId: SubscriptionPlan.ANNUAL,
    months: 12,
    boosts: 15,
    amount: 178.8,  // 12 × ₪14.90
    displayPrice: "₪14.90 / לחודש",
  },
};

export function resolvePlan(planId: string): PlanConfig {
  if (!isValidPlan(planId)) {
    throw new Error(`Unknown subscription plan: "${planId}"`);
  }

  return PLAN_METADATA[planId];
}

export function resolvePlanFromMonths(months: number): SubscriptionPlan {
  switch (months) {
    case 1:
      return SubscriptionPlan.BASIC;
    case 3:
      return SubscriptionPlan.POPULAR;
    case 12:
      return SubscriptionPlan.ANNUAL;
    default:
      return SubscriptionPlan.POPULAR;
  }
}

export function isValidPlan(planId: string): planId is SubscriptionPlan {
  return Object.values(SubscriptionPlan).includes(planId as SubscriptionPlan);
}

export function isPaidPlan(plan: SubscriptionPlan): boolean {
  return plan !== SubscriptionPlan.FREE;
}

export function getAllPaidPlans(): PlanConfig[] {
  return [
    SubscriptionPlan.BASIC,
    SubscriptionPlan.POPULAR,
    SubscriptionPlan.ANNUAL,
  ].map(resolvePlan);
}
