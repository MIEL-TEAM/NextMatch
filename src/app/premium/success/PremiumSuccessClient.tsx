"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon, { type IconNames } from "@/lib/table/Icon";

interface PremiumSuccessClientProps {
  firstName: string;
  boosts: number;
}

interface FeatureCard {
  icon: IconNames;
  title: string;
  description: string;
  highlight?: boolean;
}

function buildFeatures(boosts: number): FeatureCard[] {
  const base: FeatureCard[] = [
    {
      icon: "message-dots",
      title: "הודעות ללא הגבלה",
      description: "שוחח עם כל מי שאהבת — ללא מגבלת הודעות",
    },
    {
      icon: "heart",
      title: "לייקים ללא הגבלה",
      description: "שלח לייקים לכמה פרופילים שתרצה מדי יום",
    },
    {
      icon: "eye",
      title: "ראה מי צפה בפרופיל שלך",
      description: "גלה בדיוק מי מתעניין בך ופנה אליו",
      highlight: true,
    },
    {
      icon: "wand-magic-sparkles",
      title: "עוזר AI מורחב",
      description: "קבל הצעות שיחה חכמות והמלצות מותאמות",
    },
    {
      icon: "sliders",
      title: "פילטרים מתקדמים",
      description: "מצא בדיוק את מה שאתה מחפש עם סינון מדויק",
    },
  ];

  if (boosts > 0) {
    base.push({
      icon: "gem",
      title: `${boosts} בוסטים לחיזוק החשיפה`,
      description: "הפוך את הפרופיל שלך לבולט יותר בתוצאות החיפוש",
    });
  }

  return base;
}

export default function PremiumSuccessClient({
  firstName,
  boosts,
}: PremiumSuccessClientProps) {
  const router = useRouter();
  const features = buildFeatures(boosts);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 w-full max-w-5xl rounded-3xl overflow-hidden shadow-md border border-stone-200">

        {/* ── Right hero (image) — UNCHANGED ────────────────────── */}
        <div className="hidden lg:flex relative flex-col justify-end p-12 min-h-[560px] overflow-hidden">
          <Image
            src="/images/subscribed.jpg"
            alt="Miel Premium"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative z-10 text-white drop-shadow-lg">
            <div className="text-6xl mb-5 select-none">💎</div>
            <h2 className="text-[34px] font-bold leading-tight mb-3">
              ברוך הבא<br />ל-Miel Premium
            </h2>
            <p className="text-white/80 text-[16px] leading-relaxed">
              עכשיו אתה יכול להכיר אנשים<br />בצורה חופשית יותר.
            </p>
          </div>
        </div>

        {/* ── Left — enhanced content panel ────────────────────── */}
        <div className="bg-white px-8 py-10 lg:px-10 lg:py-12 flex flex-col justify-center">

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

          {/* ── Desktop header + progress ────────────────────────── */}
          <div className="hidden lg:block mb-7">
            <h1 className="text-[26px] font-bold text-stone-950 tracking-tight mb-1">
              {firstName ? `ברוך הבא, ${firstName}!` : "ברוך הבא!"}
            </h1>
            <p className="text-stone-400 text-[14px] mb-5">
              המנוי שלך פעיל. הנה מה שפתחת עכשיו:
            </p>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-stone-500">סטטוס Premium</span>
                <span className="text-[12px] font-semibold text-amber-700">פעיל 100%</span>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-amber-400 to-amber-700 rounded-full transition-all duration-700"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>

          {/* ── Feature cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {features.map((feature) =>
              feature.highlight ? (
                <HighlightCard key={feature.title} feature={feature} />
              ) : (
                <PlainCard key={feature.title} feature={feature} />
              )
            )}
          </div>

          {/* ── Premium tag callout ─────────────────────────────── */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-stone-50 rounded-xl border border-stone-100 mb-6">
            <span className="text-lg leading-none select-none mt-0.5">🔥</span>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              עכשיו יש לך{" "}
              <span className="font-semibold text-amber-700">תג פרימיום</span>{" "}
              בפרופיל שלך — פרופילים עם פרימיום מקבלים יותר אינטראקציות.
            </p>
          </div>

          {/* ── CTA section ─────────────────────────────────────── */}
          <div className="space-y-3">
            <p className="text-center text-[12px] text-stone-400">
              ⭐ רוב המשתמשים מצאו שידוך טוב יותר עם פרימיום
            </p>
            <button
              onClick={() => router.push("/members")}
              className="w-full py-3.5 rounded-xl bg-amber-700 text-white text-[15px] font-semibold hover:bg-amber-800 active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-amber-200 hover:shadow-md"
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
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function PlainCard({ feature }: { feature: FeatureCard }) {
  return (
    <div className="group flex items-start gap-3 px-4 py-3.5 bg-stone-50 rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default">
      <div className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 group-hover:bg-amber-100 transition-colors duration-200">
        <Icon
          name={feature.icon}
          type="sol"
          className="bg-amber-600 size-[15px]"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-stone-800 leading-tight mb-0.5">
          {feature.title}
        </p>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

function HighlightCard({ feature }: { feature: FeatureCard }) {
  return (
    <div className="group relative flex items-start gap-3 px-4 py-3.5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default">
      {/* Popular badge */}
      <span className="absolute top-2.5 left-3 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-700 text-white text-[9px] font-semibold tracking-wide uppercase">
        ⭐ פופולרי
      </span>
      <div className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 group-hover:bg-amber-200 transition-colors duration-200">
        <Icon
          name={feature.icon}
          type="sol"
          className="bg-amber-700 size-[15px]"
        />
      </div>
      <div className="min-w-0 pt-4">
        <p className="text-[13px] font-semibold text-amber-900 leading-tight mb-0.5">
          {feature.title}
        </p>
        <p className="text-[11px] text-amber-700/70 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}
