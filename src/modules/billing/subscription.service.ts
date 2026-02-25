import { add } from "date-fns";
import {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionPlan,
  WebhookEventResult,
  CheckoutSessionData,
  SubscriptionData,
  GrantPremiumInput,
} from "./subscription.types";
import {
  getSubscriptionState,
  getSubscriptionStateByProviderSubscriptionId,
  grantPremium,
  renewPremium,
  markCanceled,
  revokePremium,
  clearProviderSubscriptionId,
} from "./subscription.repository";
import { resolvePlan, resolvePlanFromMonths } from "./plan.resolver";

export async function getSubscription(
  userId: string
): Promise<SubscriptionState | null> {
  return getSubscriptionState(userId);
}

export function isExpired(state: SubscriptionState): boolean {
  if (!state.premiumUntil) return true;
  return new Date(state.premiumUntil) < new Date();
}

export function isAccessible(state: SubscriptionState): boolean {
  return (
    state.status === SubscriptionStatus.ACTIVE ||
    state.status === SubscriptionStatus.CANCELED
  ) && !isExpired(state);
}

export async function processCheckoutCompletion(
  sessionData: CheckoutSessionData
): Promise<WebhookEventResult> {
  const { userId, plan: rawPlan, months: rawMonths, customerId, subscriptionId } =
    sessionData;

  if (!userId) {
    return { processed: false, eventType: "checkout.completed" };
  }

  const planId =
    rawPlan ??
    (rawMonths ? resolvePlanFromMonths(rawMonths) : SubscriptionPlan.POPULAR);

  const planConfig = resolvePlan(planId);
  const premiumUntil = add(new Date(), { months: planConfig.months });

  const input: GrantPremiumInput = {
    userId,
    plan: planConfig.planId,
    premiumUntil,
    boostsToAdd: planConfig.boosts,
    providerCustomerId: customerId ?? undefined,
    providerSubscriptionId: subscriptionId ?? undefined,
  };

  await grantPremium(input);

  return { processed: true, eventType: "checkout.completed", userId };
}

export async function processSubscriptionRenewal(
  subscriptionData: SubscriptionData,
  providerSubscriptionId: string
): Promise<WebhookEventResult> {
  const state = await getSubscriptionStateByProviderSubscriptionId(
    providerSubscriptionId
  );

  if (!state) {
    return { processed: false, eventType: "invoice.paid" };
  }

  await renewPremium({
    userId: state.userId,
    premiumUntil: subscriptionData.currentPeriodEnd,
  });

  return { processed: true, eventType: "invoice.paid", userId: state.userId };
}

export async function processSubscriptionUpdate(
  subscriptionData: SubscriptionData,
  providerSubscriptionId: string
): Promise<WebhookEventResult> {
  const state = await getSubscriptionStateByProviderSubscriptionId(
    providerSubscriptionId
  );

  if (!state) {
    return { processed: false, eventType: "subscription.updated" };
  }

  if (subscriptionData.cancelAtPeriodEnd) {
    await markCanceled({
      userId: state.userId,
      premiumUntil: subscriptionData.currentPeriodEnd,
    });
  } else if (state.status === SubscriptionStatus.CANCELED) {
    await renewPremium({
      userId: state.userId,
      premiumUntil: subscriptionData.currentPeriodEnd,
    });
  }

  return {
    processed: true,
    eventType: "subscription.updated",
    userId: state.userId,
  };
}

export async function processSubscriptionDeletion(
  providerSubscriptionId: string
): Promise<WebhookEventResult> {
  const state = await getSubscriptionStateByProviderSubscriptionId(
    providerSubscriptionId
  );

  if (!state) {
    return { processed: false, eventType: "subscription.deleted" };
  }

  await revokePremium({ userId: state.userId });
  await clearProviderSubscriptionId(state.userId);

  return {
    processed: true,
    eventType: "subscription.deleted",
    userId: state.userId,
  };
}

export async function processPaymentFailure(
  providerSubscriptionId: string
): Promise<WebhookEventResult> {
  const state = await getSubscriptionStateByProviderSubscriptionId(
    providerSubscriptionId
  );

  if (!state) {
    return { processed: false, eventType: "invoice.payment_failed" };
  }

  if (state.premiumUntil && new Date(state.premiumUntil) > new Date()) {
    await markCanceled({
      userId: state.userId,
      premiumUntil: state.premiumUntil,
    });
  } else {
    await revokePremium({ userId: state.userId });
  }

  return {
    processed: true,
    eventType: "invoice.payment_failed",
    userId: state.userId,
  };
}
