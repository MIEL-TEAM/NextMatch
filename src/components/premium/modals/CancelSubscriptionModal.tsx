// premium/modals/CancelSubscriptionModal.tsx
import React from "react";
import AppModal from "@/components/AppModal";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

// CancelSubscriptionModal
export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelSubscriptionModalProps) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      header="ביטול מנוי פרמיום"
      body={
        <div className="py-4 text-right">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-right">האם אתה בטוח?</h3>
          <p className="text-gray-600 mb-4 text-right">
            ביטול המנוי יבטל את החיובים העתידיים, אך תמשיך ליהנות מיתרונות
            הפרמיום עד סוף תקופת החיוב הנוכחית.
          </p>
        </div>
      }
      footerButtons={[
        {
          color: "danger",
          onPress: onConfirm,
          isLoading: isLoading,
          children: "בטל מנוי",
        },
        {
          color: "primary",
          variant: "flat",
          onPress: onClose,
          children: "שמור את המנוי",
        },
      ]}
    />
  );
}
