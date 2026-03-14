"use client";

import type { PlanOption } from "./types";
import { PlanCard } from "./PlanCard";


const FREE_CARD = {
  name: "חינם",
  price: "₪0",
  period: "לחודש",
  ctaLabel: "התחל בחינם",
  features: [
    "עד 5 הודעות לשיחה",
    "עד 3 לייקים ביום",
    "ללא צפייה במי ביקר בפרופיל",
    "ללא פילטרים מתקדמים",
  ],
} as const;

const CORE_PREMIUM_FEATURES = [
  "הודעות ללא הגבלה",
  "לייקים ללא הגבלה",
  "ראה מי צפה בפרופיל שלך",
  "פילטרים מתקדמים",
  "עוזר AI מורחב",
] as const;

const PLAN_META: Record<
  string,
  { name: string; features: string[]; subtext?: string }
> = {
  basic: {
    name: "בסיסי",
    features: [...CORE_PREMIUM_FEATURES, "5 בוסטים לפרופיל"],
  },
  popular: {
    name: "פופולרי",
    features: [...CORE_PREMIUM_FEATURES, "10 בוסטים לפרופיל"],
  },
  annual: {
    name: "שנתי",
    features: [...CORE_PREMIUM_FEATURES, "15 בוסטים לפרופיל"],
    subtext: "הכי משתלם לחיפוש רציני",
  },
};

const CTA_LABELS: Record<string, string> = {
  FREE: "הצטרף עכשיו",
  ACTIVE: "עבור לתוכנית זו",
  CANCELED: "בחר תוכנית זו",
  PAST_DUE: "בחר תוכנית זו",
};

const HIGHLIGHTED_PLAN = "popular";

// ─── Component ────────────────────────────────────────────────────────────────

interface PricingGridProps {
  plans: PlanOption[];
  onActivate: (planId: string, months: number) => void;
  loadingPlan: string | null;
  activePlanId: string | null;
  pageStatus: string;
  showFreePlan?: boolean;
}

export function PricingGrid({
  plans,
  onActivate,
  loadingPlan,
  activePlanId,
  pageStatus,
  showFreePlan = false,
}: PricingGridProps) {
  const isAnyLoading = loadingPlan !== null;
  const ctaLabel = CTA_LABELS[pageStatus] ?? "הצטרף עכשיו";
  const gridCols = showFreePlan
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-5 items-stretch py-3`} dir="rtl">
      {showFreePlan && (
        <PlanCard
          name={FREE_CARD.name}
          price={FREE_CARD.price}
          period={FREE_CARD.period}
          features={[...FREE_CARD.features]}
          ctaLabel={FREE_CARD.ctaLabel}
          state="FREE"
        />
      )}

      {plans.map((plan) => {
        const meta = PLAN_META[plan.planId];
        const [price, period] = splitPrice(plan.displayPrice);
        const isActive = plan.planId === activePlanId;

        return (
          <PlanCard
            key={plan.planId}
            name={meta?.name ?? plan.planId}
            price={price}
            period={period}
            features={meta?.features ?? []}
            subtext={meta?.subtext}
            ctaLabel={ctaLabel}
            state={isActive ? "ACTIVE" : "AVAILABLE"}
            isHighlighted={plan.planId === HIGHLIGHTED_PLAN}
            isLoading={loadingPlan === plan.planId}
            isDisabled={isAnyLoading && loadingPlan !== plan.planId}
            onActivate={() => onActivate(plan.planId, plan.months)}
            boosts={plan.boosts}
          />
        );
      })}
    </div>
  );
}

function splitPrice(displayPrice: string): [string, string] {
  const match = displayPrice.match(/^(.+?)\s*\/\s*(.+)$/);
  return match ? [match[1].trim(), match[2].trim()] : [displayPrice, ""];
}
