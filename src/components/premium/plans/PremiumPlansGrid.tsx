import React from "react";
import { PremiumPlanCard } from "./PremiumPlanCard";

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
  return (
    <div className="w-full px-6 grid grid-cols-4 gap-6 items-stretch">
      {/* FREE */}
      <PremiumPlanCard
        title="חינם"
        price="0"
        period="לחודש"
        subline="להתחיל להכיר אנשים בצורה טבעית ונעימה, עם צעדים ראשונים פשוטים ונוחים עבורך"
        features={basicFeatures}
        buttonText="הפעל חשבון חינם"
        isLoading={loadingPlan === "basic"}
        onActivate={() => onActivatePremium("basic", 1)}
        isActive={activePlan === "basic"}
        isCanceled={activePlan === "basic" && isCanceled}
        canceledAt={activePlan === "basic" ? canceledAt : null}
        premiumUntil={activePlan === "basic" ? premiumUntil : null}
        onCancel={activePlan === "basic" && !isCanceled ? onCancel : undefined}
      />

      {/* MONTHLY */}
      <PremiumPlanCard
        title="חודשי"
        price="₪29.90"
        period="לחודש"
        subline="לקבל בוסט משמעותי לחשיפה ולהתאמות, ולהגדיל את סיכויי ההצלחה שלך"
        description="חודש של פרימיום"
        features={basicFeatures}
        buttonText="הפעל חשבון פרימיום"
        isLoading={loadingPlan === "basic"}
        onActivate={() => onActivatePremium("basic", 1)}
        isActive={activePlan === "basic"}
        isCanceled={activePlan === "basic" && isCanceled}
        canceledAt={activePlan === "basic" ? canceledAt : null}
        premiumUntil={activePlan === "basic" ? premiumUntil : null}
        onCancel={activePlan === "basic" && !isCanceled ? onCancel : undefined}
      />

      {/* POPULAR */}
      <PremiumPlanCard
        title="פופולרי"
        price="₪19.90"
        period="לחודש"
        subline="שלושה חודשים שמגבירים את סיכויי ההתאמה ומאפשרים לבנות חיבור אמיתי בקצב מדויק"
        description="3 חודשים של פרימיום"
        features={popularFeatures}
        buttonText="בחר תוכנית פופולרית"
        isLoading={loadingPlan === "popular"}
        onActivate={() => onActivatePremium("popular", 3)}
        isHighlighted
        isActive={activePlan === "popular"}
        isCanceled={activePlan === "popular" && isCanceled}
        canceledAt={activePlan === "popular" ? canceledAt : null}
        premiumUntil={activePlan === "popular" ? premiumUntil : null}
        onCancel={
          activePlan === "popular" && !isCanceled ? onCancel : undefined
        }
      />

      {/* ANNUAL */}
      <PremiumPlanCard
        title="שנתי"
        price="₪14.90"
        period="לחודש"
        subline="המסלול המשתלם והיציב ביותר להתקדמות רצינית ולבניית קשרים משמעותיים לאורך זמן"
        description="שנה של פרימיום"
        features={annualFeatures}
        buttonText="בחר תוכנית שנתית"
        isLoading={loadingPlan === "annual"}
        onActivate={() => onActivatePremium("annual", 12)}
        isActive={activePlan === "annual"}
        isCanceled={activePlan === "annual" && isCanceled}
        canceledAt={activePlan === "annual" ? canceledAt : null}
        premiumUntil={activePlan === "annual" ? premiumUntil : null}
        onCancel={activePlan === "annual" && !isCanceled ? onCancel : undefined}
      />
    </div>
  );
}
