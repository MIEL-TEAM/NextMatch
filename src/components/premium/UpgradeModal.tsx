"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import useUpgradeModal from "@/hooks/useUpgradeModal";

export default function UpgradeModal() {
  const router = useRouter();
  const isOpen = useUpgradeModal((state) => state.isOpen);
  const close = useUpgradeModal((state) => state.close);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    close();
    router.push("/premium");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >

      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />


      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">

        <button
          onClick={close}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="סגור"
        >
          <X size={20} />
        </button>


        <div className="text-center mb-5">
          <span className="text-4xl" aria-hidden="true">💬</span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            ההודעה מחכה לך
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            כדי לראות את מה שנשלח אליך ולהמשיך את השיחה
          </p>
        </div>


        <hr className="border-gray-100 mb-5" />

  
        <ul className="space-y-3 mb-6">
          {[
            "קריאת הודעות ללא הגבלה",
            "שליחת הודעות ללא הגבלה",
            "חוויית שיחה מלאה",
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-green-500 font-bold flex-shrink-0">✔</span>
              {benefit}
            </li>
          ))}
        </ul>


        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-l from-amber-400 to-orange-500 text-white py-3 rounded-xl font-semibold text-base hover:from-amber-500 hover:to-orange-600 transition-all shadow-sm"
        >
          שדרג עכשיו ל-Miel+
        </button>


        <p className="text-center text-xs text-gray-400 mt-3">
          השיחה פעילה עכשיו
        </p>
      </div>
    </div>
  );
}
