// premium/plans/PremiumPlansGrid.tsx
import React from "react";
import { PremiumPlanCard } from "./PremiumPlanCard";
import { FiDroplet, FiAward, FiStar } from "react-icons/fi";

interface Feature {
  text: string;
  icon: React.ReactNode;
}

interface PremiumPlansGridProps {
  onActivatePremium: (planId: string, months: number) => void;
  loadingPlan: string | null;
  basicFeatures: Feature[];
  popularFeatures: Feature[];
  annualFeatures: Feature[];
  activePlan?: string | null;
  isCanceled?: boolean;
  canceledAt?: Date | null;
  premiumUntil?: Date | null;
  onCancel?: () => void;
}

export function PremiumPlansGrid({
  onActivatePremium,
  loadingPlan,
  basicFeatures,
  popularFeatures,
  annualFeatures,
  activePlan,
  isCanceled = false,
  canceledAt = null,
  premiumUntil = null,
  onCancel,
}: PremiumPlansGridProps) {
  // Helper to determine if premium is active
  const isPremium = !!activePlan;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <PremiumPlanCard
        title="בסיסי"
        price="₪29.90 / חודש"
        description="חודש של פרימיום"
        features={basicFeatures}
        buttonText="הפעל חשבון פרימיום"
        isLoading={loadingPlan === "basic"}
        onActivate={() => onActivatePremium("basic", 1)}
        planIcon={<FiDroplet size={32} />}
        isActive={activePlan === "basic"}
        isCanceled={activePlan === "basic" && isCanceled}
        canceledAt={activePlan === "basic" ? canceledAt : null}
        premiumUntil={activePlan === "basic" ? premiumUntil : null}
        onCancel={activePlan === "basic" && !isCanceled ? onCancel : undefined}
      />

      <PremiumPlanCard
        title="פופולרי"
        price="₪19.90 / לחודש"
        description="3 חודשים של פרימיום"
        features={popularFeatures}
        buttonText="בחר תוכנית פופולרית"
        isLoading={loadingPlan === "popular"}
        onActivate={() => onActivatePremium("popular", 3)}
        isHighlighted={true}
        planIcon={<FiAward size={32} />}
        isActive={activePlan === "popular"}
        isCanceled={activePlan === "popular" && isCanceled}
        canceledAt={activePlan === "popular" ? canceledAt : null}
        premiumUntil={activePlan === "popular" ? premiumUntil : null}
        onCancel={
          activePlan === "popular" && !isCanceled ? onCancel : undefined
        }
      />

      <PremiumPlanCard
        title="שנתי"
        price="₪14.90 / לחודש"
        description="שנה של פרימיום"
        features={annualFeatures}
        buttonText="בחר תוכנית שנתית"
        isLoading={loadingPlan === "annual"}
        onActivate={() => onActivatePremium("annual", 12)}
        planIcon={<FiStar size={32} />}
        isActive={activePlan === "annual"}
        isCanceled={activePlan === "annual" && isCanceled}
        canceledAt={activePlan === "annual" ? canceledAt : null}
        premiumUntil={activePlan === "annual" ? premiumUntil : null}
        onCancel={activePlan === "annual" && !isCanceled ? onCancel : undefined}
      />
    </div>
  );
}
