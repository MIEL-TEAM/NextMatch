"use client";

import { SubscriptionCard } from "./SubscriptionCard";
import { PricingGrid } from "./PricingGrid";
import { SectionTitle } from "./primitives";
import type { PremiumState } from "./types";

type SubscriberState = Extract<
  PremiumState,
  { status: "ACTIVE" | "CANCELED" | "PAST_DUE" }
>;

const SWITCHER_HEADING: Record<SubscriberState["status"], string> = {
  ACTIVE: "שנה תוכנית",
  CANCELED: "בחר תוכנית",
  PAST_DUE: "בחר תוכנית",
};

interface SubscriberViewProps {
  state: SubscriberState;
  onActivate: (planId: string, months: number) => void;
  onCancelRequest: () => void;
  onRenew: () => void;
  loadingPlan: string | null;
  isActionLoading: boolean;
}

export function SubscriberView({
  state,
  onActivate,
  onCancelRequest,
  onRenew,
  loadingPlan,
  isActionLoading,
}: SubscriberViewProps) {
  const activePlanId =
    state.status === "PAST_DUE" ? null : state.subscription.planId;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SubscriptionCard
        status={state.status}
        subscription={state.subscription}
        onCancelRequest={onCancelRequest}
        onRenew={onRenew}
        isActionLoading={isActionLoading}
      />

      <div>
        <SectionTitle>{SWITCHER_HEADING[state.status]}</SectionTitle>
        <div className="mt-4">
          <PricingGrid
            plans={state.availablePlans}
            onActivate={onActivate}
            loadingPlan={loadingPlan}
            activePlanId={activePlanId}
            pageStatus={state.status}
          />
        </div>
      </div>
    </div>
  );
}
