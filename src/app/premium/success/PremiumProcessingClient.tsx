"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PremiumProcessingClient() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh();
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4"
      dir="rtl"
    >
      <div className="w-10 h-10 rounded-full border-4 border-amber-700 border-t-transparent animate-spin" />
      <div className="space-y-2">
        <h1 className="text-[22px] font-bold text-stone-950 tracking-tight">
          מעבד את התשלום שלך…
        </h1>
        <p className="text-[14px] text-stone-500">
          זה יקח רגע. הדף יתעדכן אוטומטית.
        </p>
      </div>
    </div>
  );
}
