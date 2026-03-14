"use client";

import Icon from "@/lib/table/Icon";
import Image from "next/image";
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
        <div className="hidden lg:flex relative flex-col justify-end p-12 min-h-[560px] overflow-hidden">
          <Image
            src="/images/subscribed.jpg"
            alt="Miel Premium"
            fill
            className="object-cover object-center"
            priority
          />
          {/* gradient overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="relative z-10 text-white drop-shadow-lg">
            <div className="text-6xl mb-6 select-none"><Icon name="gem" type="sol" className="size-[30px] bg-secondary" /></div>
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
            <div className="text-5xl mb-4 select-none"><Icon name="gem" type="sol" className="size-[30px] bg-secondary" /></div>
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
            <span className="text-lg select-none"><Icon name="fire" type="sol" className="size-[30px] bg-secondary" /></span>
            <p className="text-[13px] text-stone-600">
              עכשיו יש לך{" "}
              <span className="font-semibold text-amber-700">תג פרימיום</span>
              {" "}בפרופיל שלך פרופילים עם פרימיום מקבלים יותר אינטראקציות.
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
            גלה אנשים חדשים <Icon name="arrow-left" type="sol" className="size-[15px] bg-secondary" />
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
