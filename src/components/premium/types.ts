import type React from "react";

export interface PlanOption {
  planId: string;
  months: number;
  boosts: number;
  displayPrice: string;
}

export interface SubscriptionSnapshot {
  planId: string;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  boostsAvailable: number;
  premiumUntil: Date | null;
  activatedAt: Date | null;
}

export type PremiumState =
  | { status: "FREE"; availablePlans: PlanOption[] }
  | { status: "PENDING"; subscription: SubscriptionSnapshot; availablePlans: PlanOption[] }
  | { status: "ACTIVE"; subscription: SubscriptionSnapshot; availablePlans: PlanOption[] }
  | { status: "PAST_DUE"; subscription: SubscriptionSnapshot; availablePlans: PlanOption[] }
  | { status: "CANCELED"; subscription: SubscriptionSnapshot; availablePlans: PlanOption[] };

export interface Feature {
  text: string | React.ReactNode;
  icon: React.ReactNode;
}

export interface StatusMessage {
  message: string;
  type: "success" | "error" | "warning";
}
