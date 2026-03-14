"use client";

interface ActivationViewProps {
  firstName: string;
  boosts: number;
  onDone: () => void;
}

function benefits(boosts: number): string[] {
  return [
    "הודעות ללא הגבלה לכל שיחה",
    "לייקים ללא הגבלה בכל יום",
    "ראה מי צפה בפרופיל שלך",
    "עוזר AI מורחב",
    `${boosts} בוסטים לחיזוק החשיפה שלך`,
    "פילטרים מתקדמים לחיפוש",
  ];
}

export function ActivationView({ firstName, boosts, onDone }: ActivationViewProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-8 max-w-md mx-auto text-center"
      dir="rtl"
    >
      <div className="text-5xl select-none">💎</div>

      <div className="space-y-2">
        <h1 className="text-[28px] font-bold text-stone-950 tracking-tight">
          ברוך הבא ל-Miel Premium{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-[15px] text-stone-500">המנוי שלך פעיל. הנה מה שמחכה לך:</p>
      </div>

      <ul className="space-y-3 w-full">
        {benefits(boosts).map((b, i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100"
          >
            <BenefitCheck />
            <span className="text-[14px] text-amber-800 font-medium text-right">{b}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onDone}
        className="w-full max-w-xs py-3 rounded-xl bg-amber-700 text-white text-[15px] font-medium hover:bg-amber-800 transition-colors duration-150"
      >
        התחל עכשיו
      </button>
    </div>
  );
}

function BenefitCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-amber-600"
      aria-hidden="true"
    >
      <path
        d="M3 8l3.5 3.5 6.5-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
