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
        <div className="hidden lg:flex relative flex-col justify-end p-12 min-h-[480px] overflow-hidden">
          <Image
            src="/images/subscribed.jpg"
            alt="Miel Premium"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="relative z-10 text-white drop-shadow-lg">
            <div className="text-6xl mb-5 select-none"><Icon name="gem" /></div>
            <h2 className="text-[34px] font-bold leading-tight mb-3">
              ברוך הבא<br />ל-Miel Premium
            </h2>
            <p className="text-white/80 text-[16px] leading-relaxed">
              עכשיו אתה יכול להכיר אנשים<br />בצורה חופשית יותר.
            </p>
          </div>
        </div>

        {/* ── Left — enhanced content panel ────────────────────── */}
        <div className="bg-white px-8 py-8 lg:px-10 lg:py-8 flex flex-col justify-center">

          {/* Mobile headline */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-4 select-none"><Icon name="gem" /></div>
            <h1 className="text-[26px] font-bold text-stone-950 tracking-tight">
              ברוך הבא ל-Miel Premium
              {firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="text-stone-500 text-[14px] mt-2">
              עכשיו אתה יכול להכיר אנשים בצורה חופשית יותר.
            </p>
          </div>

          {/* ── Desktop header + progress ────────────────────────── */}
          <div className="hidden lg:block mb-4">
            <h1 className="text-[26px] font-bold text-stone-950 tracking-tight mb-1">
              {firstName ? `ברוך הבא, ${firstName}!` : "ברוך הבא!"}
            </h1>
            <p className="text-stone-400 text-[14px] mb-3">
              המנוי שלך פעיל. הנה מה שפתחת עכשיו:
            </p>
          </div>

          {/* ── Feature cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {features.map((feature) =>
              feature.highlight ? (
                <HighlightCard key={feature.title} feature={feature} />
              ) : (
                <PlainCard key={feature.title} feature={feature} />
              )
            )}
          </div>

          {/* ── Premium tag callout ─────────────────────────────── */}
          <div className="flex items-start gap-2.5 px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-100 mb-4">
            <span className="text-lg leading-none select-none mt-0.5"><Icon name="fire" /></span>
            <p className="text-[13px] text-stone-600 leading-relaxed">
              עכשיו יש לך{" "}
              <span className="font-semibold text-amber-700">תג פרימיום</span>{" "}
              בפרופיל שלך — פרופילים עם פרימיום מקבלים יותר אינטראקציות.
            </p>
          </div>

          {/* ── CTA section ─────────────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-center text-[12px] text-stone-400">
              <Icon name="star" /> רוב המשתמשים מצאו שידוך טוב יותר עם פרימיום
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
              <Icon name="eye" /> גלה אנשים חדשים ←
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
    <div className="group flex items-center gap-3 px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default">
      <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 group-hover:bg-amber-100 transition-colors duration-200">
        <Icon
          name={feature.icon}
          type="sol"
          className="bg-amber-600 size-[13px]"
        />
      </div>
      <p className="text-[13px] font-semibold text-stone-800 leading-tight">
        {feature.title}
      </p>
    </div>
  );
}

function HighlightCard({ feature }: { feature: FeatureCard }) {
  return (
    <div className="group relative flex items-center gap-3 px-3.5 py-2.5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default">
      {/* Popular badge */}
      <span className="absolute -top-2 left-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-700 text-white text-[9px] font-semibold tracking-wide">
        <Icon name="star" /> פופולרי
      </span>
      <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 group-hover:bg-amber-200 transition-colors duration-200">
        <Icon
          name={feature.icon}
          type="sol"
          className="bg-amber-700 size-[13px]"
        />
      </div>
      <p className="text-[13px] font-semibold text-amber-900 leading-tight">
        {feature.title}
      </p>
    </div>
  );
}
