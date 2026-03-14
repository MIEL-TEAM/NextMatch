import type { PlanOption } from "./types";
import { PricingGrid } from "./PricingGrid";
import Icon from "@/lib/table/Icon";

interface ProspectViewProps {
  plans: PlanOption[];
  onActivate: (planId: string, months: number) => void;
  loadingPlan: string | null;
}

const FEATURES = [
  {
    icon: <Icon name="message" />,
    title: "שיחות ללא הגבלה",
    desc: "שלח וקבל הודעות ללא הגבלה.",
  },
  {
    icon: <Icon name="heart" />,
    title: "לייקים ללא הגבלה",
    desc: "אהב כמה פרופילים שרוצה בכל יום.",
  },
  {
    icon: <Icon name="eye" />,
    title: "ראה מי צפה בפרופיל שלך",
    desc: "דע בדיוק מי בדק את הפרופיל שלך.",
  },
  {
    icon: <Icon name="robot" />,
    title: "עוזר AI מורחב",
    desc: "קבל עזרה בניסוח הודעות ושיפור הפרופיל.",
  },
  {
    icon: <Icon name="filter" />,
    title: "פילטרים מתקדמים",
    desc: "מצא התאמות טובות יותר עם פילטרים מפורטים.",
  },
  {
    icon: <Icon name="bolt" />,
    title: "בוסטים לפרופיל",
    desc: "בלוט בפיד הגילוי וקבל יותר תשומת לב.",
  },
] as const;

export function ProspectView({ plans, onActivate, loadingPlan }: ProspectViewProps) {
  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* ── Split hero ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden mb-12 shadow-sm border border-stone-200">
        {/* Left — decorative hero */}
        <div
          className="hidden lg:flex relative flex-col justify-end p-10 min-h-[460px]"
          style={{
            background:
              "linear-gradient(145deg, #78350f 0%, #92400e 35%, #b45309 65%, #d97706 100%)",
          }}
        >
          {/* decorative circles */}
          <div className="absolute top-8 right-8 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-24 right-24 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute bottom-36 left-8 w-28 h-28 rounded-full bg-white/[0.07]" />
          <div className="absolute bottom-12 left-24 w-12 h-12 rounded-full bg-white/10" />

          <div className="relative z-10 text-white">
            <div className="text-5xl mb-6 select-none">💎</div>
            <h2 className="text-[32px] font-bold leading-tight mb-3">
              מצא התאמות טובות יותר<br />עם Miel Premium
            </h2>
            <p className="text-white/75 text-[16px] leading-relaxed">
              יותר חשיפה. יותר שליטה.<br />יותר סיכוי לחיבור אמיתי.
            </p>
          </div>
        </div>

        {/* Right — feature grid */}
        <div className="bg-white p-8 lg:p-10">
          {/* Mobile-only headline */}
          <div className="lg:hidden mb-6 text-center">
            <div className="text-4xl mb-3 select-none">💎</div>
            <h1 className="text-[24px] font-bold text-stone-950 tracking-tight">
              Miel Premium
            </h1>
            <p className="text-stone-500 text-[14px] mt-1">
              יותר חשיפה. יותר שליטה. יותר חיבורים.
            </p>
          </div>

          {/* Desktop headline */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-[22px] font-bold text-stone-950 tracking-tight">
              מה מחכה לך
            </h1>
            <p className="text-stone-500 text-[14px] mt-1">
              כל הכלים לחיבור אמיתי ומשמעותי.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-100"
              >
                <span className="text-[22px] leading-none mt-0.5 shrink-0 select-none">
                  {icon}
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-stone-800 leading-tight">
                    {title}
                  </div>
                  <div className="text-[12px] text-stone-500 mt-0.5 leading-snug">
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <h2 className="text-[22px] font-bold text-stone-950 mb-2">
          בחרו את התוכנית שלכם
        </h2>
        <p className="text-stone-500 text-[15px]">ביטול בכל עת. ללא התחייבות.</p>
      </div>

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
