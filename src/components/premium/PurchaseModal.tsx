"use client";

import { PrimaryButton, SecondaryButton } from "./primitives";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planLabel: string;
  displayPrice: string;
  boosts: number;
}

export function PurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  planLabel,
  displayPrice,
  boosts,
}: PurchaseModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-lg border border-stone-200 w-full max-w-sm p-6">
        <h3 className="text-[18px] font-semibold text-stone-900 mb-4">
          הצטרפות לתוכנית {planLabel}
        </h3>

        <div className="bg-stone-50 border border-stone-200 rounded-md p-4 mb-6 space-y-2">
          <ModalRow label="תוכנית" value={planLabel} />
          <ModalRow label="מחיר" value={displayPrice} />
          <ModalRow label="בוסטים" value={String(boosts)} />
        </div>

        <div className="flex gap-3">
          <PrimaryButton onClick={onConfirm}>המשך לתשלום</PrimaryButton>
          <SecondaryButton onClick={onClose}>ביטול</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function ModalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[14px] text-stone-400">{label}</span>
      <span className="text-[14px] text-stone-900 font-medium">{value}</span>
    </div>
  );
}
