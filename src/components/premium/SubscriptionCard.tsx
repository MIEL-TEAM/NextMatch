"use client";

import { SubscriptionBadge } from "./SubscriptionBadge";
import { PrimaryButton, MetaText, TextLink } from "./primitives";
import type { SubscriptionSnapshot } from "./types";

const PLAN_LABELS: Record<string, string> = {
  basic: "בסיסי",
  popular: "פופולרי",
  annual: "שנתי",
};

const RENEWAL_LABEL: Record<string, string> = {
  ACTIVE: "חידוש ב",
  CANCELED: "יסתיים ב",
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface SubscriptionCardProps {
  status: "ACTIVE" | "CANCELED" | "PAST_DUE";
  subscription: SubscriptionSnapshot;
  onCancelRequest: () => void;
  onRenew: () => void;
  isActionLoading: boolean;
}

export function SubscriptionCard({
  status,
  subscription,
  onCancelRequest,
  onRenew,
  isActionLoading,
}: SubscriptionCardProps) {
  const planLabel = PLAN_LABELS[subscription.planId] ?? subscription.planId;
  const endDate = subscription.currentPeriodEnd ?? subscription.premiumUntil;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-semibold text-stone-900">{planLabel}</h2>
        <SubscriptionBadge status={status} />
      </div>

      {status === "PAST_DUE" ? (
        <div className="bg-stone-50 border border-stone-200 rounded-md p-4 mb-6">
          <p className="text-[14px] text-stone-600">
            לא הצלחנו לחייב את הכרטיס. בחר תוכנית מחדש להמשך הגישה.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <MetaText>{RENEWAL_LABEL[status]}</MetaText>
            <span className="text-[14px] text-stone-600">{formatDate(endDate)}</span>
          </div>
          <div className="flex justify-between">
            <MetaText>בוסטים</MetaText>
            <span className="text-[14px] text-stone-600">
              {subscription.boostsAvailable}
            </span>
          </div>
        </div>
      )}

      {status === "CANCELED" && (
        <PrimaryButton onClick={onRenew} loading={isActionLoading}>
          חדש מנוי
        </PrimaryButton>
      )}

      {status === "ACTIVE" && (
        <TextLink onClick={onCancelRequest}>ביטול מנוי</TextLink>
      )}
    </div>
  );
}
