import type { PlanOption } from "./types";
import { PricingGrid } from "./PricingGrid";

interface ProspectViewProps {
  plans: PlanOption[];
  onActivate: (planId: string, months: number) => void;
  loadingPlan: string | null;
}

function ProspectHeader() {
  return (
    <div className="text-center mb-12" dir="rtl">
      <h1 className="text-[34px] font-bold text-stone-950 mb-3 tracking-tight">
        בחרו את התוכנית שלכם
      </h1>
      <p className="text-[16px] text-stone-500 leading-relaxed">
        יותר חשיפה. יותר שליטה. יותר סיכוי לחיבור אמיתי.
      </p>
    </div>
  );
}

export function ProspectView({ plans, onActivate, loadingPlan }: ProspectViewProps) {
  return (
    <div className="max-w-5xl mx-auto">
      <ProspectHeader />
      <PricingGrid
        plans={plans}
        onActivate={onActivate}
        loadingPlan={loadingPlan}
        activePlanId={null}
        pageStatus="FREE"
        showFreePlan={true}
      />
    </div>
  );
}
