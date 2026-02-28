"use client";

import AppModal from "@/components/AppModal";
import { useRouter } from "next/navigation";
import useUpgradeModal from "@/hooks/useUpgradeModal";

export default function UpgradeModal() {
  const router = useRouter();
  const isOpen = useUpgradeModal((state) => state.isOpen);
  const close = useUpgradeModal((state) => state.close);

  const handleUpgrade = () => {
    close();
    router.push("/premium");
  };

  const body = (
    <div className="space-y-3" dir="rtl">
      <p className="text-sm text-gray-500 text-center">
        כדי לראות את מה שנשלח אליך ולהמשיך את השיחה
      </p>
      <hr className="border-gray-100" />
      <ul className="space-y-3">
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
    </div>
  );

  return (
    <AppModal
      isOpen={isOpen}
      onClose={close}
      header="💬 ההודעה מחכה לך"
      body={body}
      footerButtons={[
        {
          children: "שדרג עכשיו ל-Miel+",
          color: "secondary" as const,
          onClick: handleUpgrade,
          className: "!max-w-full",
        },
      ]}
    />
  );
}
