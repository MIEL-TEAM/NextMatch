"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PendingViewProps {
  activated?: boolean;
}

export function PendingView({ activated = false }: PendingViewProps) {
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);
  const ticksRef = useRef(0);

  useEffect(() => {
    if (!activated) return;

    const id = setInterval(() => {
      ticksRef.current += 1;
      if (ticksRef.current >= 10) {
        clearInterval(id);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, 3000);

    return () => clearInterval(id);
  }, [activated, router]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-sm mx-auto text-center">
        <p className="text-[18px] font-semibold text-stone-900">עיבוד התשלום אורך זמן</p>
        <p className="text-[14px] text-stone-600">נסה לרענן את הדף.</p>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        >
          רענן
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-sm mx-auto text-center">
      <div className="w-10 h-10 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-[18px] font-semibold text-stone-900">מעבד תשלום</p>
      <p className="text-[14px] text-stone-600">
        אנחנו מעבדים את התשלום שלך. זה עשוי לקחת כמה רגעים.
      </p>
    </div>
  );
}
