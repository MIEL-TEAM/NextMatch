"use client";

import { useState } from "react";
import { PurchaseModal } from "./PurchaseModal";

export type PlanCardState = "AVAILABLE" | "ACTIVE" | "FREE";

export interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  subtext?: string;
  ctaLabel: string;
  state: PlanCardState;
  isHighlighted?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onActivate?: () => void;
  boosts?: number;
}

export function PlanCard({
  name,
  price,
  period,
  features,
  subtext,
  ctaLabel,
  state,
  isHighlighted = false,
  isLoading = false,
  isDisabled = false,
  onActivate,
  boosts = 0,
}: PlanCardProps) {
  const [showModal, setShowModal] = useState(false);

  const cardCls = isHighlighted
    ? "bg-white rounded-2xl flex flex-col h-full border-2 border-amber-700 shadow-md relative md:scale-[1.03] md:z-10"
    : "bg-white rounded-2xl flex flex-col h-full border border-stone-200 shadow-sm";

  return (
    <>
      <div className={cardCls} dir="rtl">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          {isHighlighted && (
            <div className="mb-3">
              <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                הנבחרת ביותר
              </span>
            </div>
          )}

          <h3 className="text-[17px] font-semibold text-stone-900 mb-4">{name}</h3>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[40px] font-bold text-stone-950 leading-none tracking-tight">
              {price}
            </span>
            <span className="text-[14px] text-stone-400 font-normal">
              / {period}
            </span>
          </div>

          {subtext && (
            <p className="text-[12px] text-stone-500 mt-2">{subtext}</p>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-stone-100" />

        {/* Body */}
        <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
          <ul className="space-y-3 flex-1 mb-6">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <ThinCheck highlighted={isHighlighted} />
                <span className="text-[14px] text-stone-600 leading-snug">{f}</span>
              </li>
            ))}
          </ul>

          <CtaButton
            label={ctaLabel}
            state={state}
            isHighlighted={isHighlighted}
            isLoading={isLoading}
            isDisabled={isDisabled}
            onClick={() => setShowModal(true)}
          />
        </div>
      </div>

      {state !== "FREE" && onActivate && (
        <PurchaseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            onActivate();
          }}
          planLabel={name}
          displayPrice={`${price} / ${period}`}
          boosts={boosts}
        />
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ThinCheck({ highlighted }: { highlighted: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`shrink-0 ${highlighted ? "text-amber-600" : "text-stone-400"}`}
      aria-hidden="true"
    >
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CtaButtonProps {
  label: string;
  state: PlanCardState;
  isHighlighted: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function CtaButton({
  label,
  state,
  isHighlighted,
  isLoading,
  isDisabled,
  onClick,
}: CtaButtonProps) {
  if (state === "ACTIVE") {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-xl text-sm bg-stone-50 text-stone-400 border border-stone-200 cursor-not-allowed"
      >
        התוכנית הנוכחית שלך
      </button>
    );
  }

  if (state === "FREE") {
    return (
      <button className="w-full py-2.5 rounded-xl text-sm text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors duration-150">
        {label}
      </button>
    );
  }

  const activeCls = isHighlighted
    ? "bg-amber-700 text-white hover:bg-amber-800"
    : "bg-stone-950 text-white hover:bg-stone-800";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
        ${activeCls}
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          מעבד...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
