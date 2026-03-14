"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface PremiumSuccessClientProps {
  firstName: string;
  boosts: number;
}

const UNLOCKED = [
  "הודעות ללא הגבלה",
  "לייקים ללא הגבלה",
  "ראה מי צפה בפרופיל שלך",
  "עוזר AI מורחב",
  "פילטרים מתקדמים",
] as const;

export default function PremiumSuccessClient({
  firstName,
  boosts,
}: PremiumSuccessClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full max-w-5xl rounded-3xl overflow-hidden shadow-md border border-stone-200">

        {/* ── Left hero ─────────────────────────────────────────── */}
        <div
          className="hidden lg:flex relative flex-col justify-end p-12 min-h-[560px]"
          style={{
            background:
              "linear-gradient(145deg, #78350f 0%, #92400e 35%, #b45309 65%, #d97706 100%)",
          }}
        >
          {/* decorative circles */}
          <div className="absolute top-8 right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute top-28 right-28 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute bottom-32 left-8 w-32 h-32 rounded-full bg-white/[0.07]" />
          <div className="absolute top-16 left-10 w-10 h-10 rounded-full bg-white/10" />

          <div className="relative z-10 text-white">
            <div className="text-6xl mb-6 select-none">💎</div>
            <h2 className="text-[34px] font-bold leading-tight mb-4">
              ברוך הבא<br />ל-Miel Premium
            </h2>
            <p className="text-white/75 text-[16px] leading-relaxed">
              עכשיו אתה יכול להכיר אנשים<br />בצורה חופשית יותר.
            </p>
          </div>
        </div>

        {/* ── Right — celebration content ──────────────────────── */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">

          {/* Mobile headline */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-4 select-none">💎</div>
            <h1 className="text-[26px] font-bold text-stone-950 tracking-tight">
              ברוך הבא ל-Miel Premium
              {firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="text-stone-500 text-[14px] mt-2">
              עכשיו אתה יכול להכיר אנשים בצורה חופשית יותר.
            </p>
          </div>

          {/* Desktop headline */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-[28px] font-bold text-stone-950 tracking-tight mb-2">
              {firstName ? `ברוך הבא, ${firstName}!` : "ברוך הבא!"}
            </h1>
            <p className="text-stone-500 text-[15px]">
              המנוי שלך פעיל. הנה מה שפתחת עכשיו:
            </p>
          </div>

          {/* Unlocked features */}
          <ul className="space-y-2.5 mb-6">
            {UNLOCKED.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100"
              >
                <CheckIcon />
                <span className="text-[14px] text-amber-800 font-medium">{item}</span>
              </li>
            ))}
            {boosts > 0 && (
              <li className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                <CheckIcon />
                <span className="text-[14px] text-amber-800 font-medium">
                  {boosts} בוסטים לחיזוק החשיפה שלך
                </span>
              </li>
            )}
          </ul>

          {/* Premium badge reinforcement */}
          <div className="flex items-center gap-2 px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 mb-7">
            <span className="text-lg select-none">🔥</span>
            <p className="text-[13px] text-stone-600">
              עכשיו יש לך{" "}
              <span className="font-semibold text-amber-700">תג פרימיום</span>
              {" "}בפרופיל שלך — פרופילים עם פרימיום מקבלים יותר אינטראקציות.
            </p>
          </div>

          {/* CTAs */}
          <button
            onClick={() => router.push("/members")}
            className="w-full py-3 rounded-xl bg-amber-700 text-white text-[15px] font-semibold hover:bg-amber-800 transition-colors duration-150 mb-3"
          >
            התחל לגלות אנשים
          </button>

          <Link
            href="/members"
            className="block text-center text-[13px] text-stone-400 hover:text-amber-700 transition-colors duration-150"
          >
            גלה אנשים חדשים ←
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
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
