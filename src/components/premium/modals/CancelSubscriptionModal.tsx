"use client";

import { SecondaryButton } from "@/components/premium/primitives";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelSubscriptionModalProps) {
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
        <h3 className="text-[18px] font-semibold text-stone-900 mb-2">
          ביטול מנוי
        </h3>
        <p className="text-[14px] text-stone-600 mb-6">
          ביטול המנוי יבטל את החיובים העתידיים. תמשיך ליהנות מהיתרונות עד סוף
          תקופת החיוב הנוכחית.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-md bg-red-600 text-white text-sm font-medium
              hover:bg-red-700 transition-colors duration-100
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "מבטל..." : "בטל מנוי"}
          </button>
          <SecondaryButton onClick={onClose} className="flex-1">
            שמור מנוי
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
