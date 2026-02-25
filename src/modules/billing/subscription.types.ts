

export enum SubscriptionPlan {
  FREE = "free",
  BASIC = "basic",
  POPULAR = "popular",
  ANNUAL = "annual",
}

export interface PlanConfig {
  planId: SubscriptionPlan;
  months: number;
  boosts: number;
  amount: number;
  displayPrice: string;
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
  NEVER_SUBSCRIBED = "NEVER_SUBSCRIBED",
}

export interface SubscriptionState {
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  isPremiumActive: boolean;
  premiumUntil: Date | null;
  canceledAt: Date | null;
  boostsAvailable: number;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
}

export interface GrantPremiumInput {
  userId: string;
  plan: SubscriptionPlan;
  premiumUntil: Date;
  boostsToAdd: number;
  providerCustomerId?: string;
  providerSubscriptionId?: string;
}

export interface RenewPremiumInput {
  userId: string;
  premiumUntil: Date;
}

export interface CancelPremiumInput {
  userId: string;
  premiumUntil: Date;
}

export interface RevokePremiumInput {
  userId: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export type WebhookEventType =
  | "checkout.completed"
  | "subscription.updated"
  | "subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "unknown";
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: unknown;
}

export interface WebhookEventResult {
  processed: boolean;
  eventType: WebhookEventType | string;
  userId?: string;
}

export type NormalizedPaymentEventType =
  | "initial_payment"
  | "recurring_payment"
  | "payment_failed"
  | "subscription_canceled";

export interface NormalizedPaymentEvent {
  type: NormalizedPaymentEventType;
  providerSubscriptionId: string;
  userId: string;
  planId: string;
  amount: number;
}

export interface CheckoutSessionData {
  sessionId: string;
  userId: string | null;
  plan: SubscriptionPlan | null;
  months: number | null;
  customerId: string | null;
  subscriptionId: string | null;
  status: "complete" | "expired" | "open";
}

export interface SubscriptionData {
  subscriptionId: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "paused";
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
