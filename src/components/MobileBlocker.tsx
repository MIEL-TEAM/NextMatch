"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-orange-500 to-orange-600 z-50 flex flex-col items-center justify-center text-center p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-xl">
        <div className="flex justify-center mb-4">
          <Image
            src="https://miel-love.com/images/icons/Logo.png"
            alt="Miel"
            width={60}
            height={60}
          />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-orange-500" dir="rtl">
          ברוכים הבאים ל-Miel!
        </h1>

        <p className="text-xl mb-4 font-medium" dir="rtl">
          אנחנו רוצים שהחוויה שלכם תהיה מדהימה
        </p>

        <p className="mb-6" dir="rtl">
          כרגע האפליקציה שלנו מעוצבת לחוויית שימוש אופטימלית במסך גדול של מחשב
          נייח או נייד בלבד, כדי להביא לכם את החיבורים הכי מדויקים – בקלות,
          במהירות ולעניין!
        </p>

        <p className="mb-4 text-orange-500 font-bold" dir="rtl">
          ובקרוב ייצא גם למובייל...
        </p>

        <p className="mb-6" dir="rtl">
          אנחנו עובדים במרץ על גרסת מובייל שתעניק לכם את אותה חוויה נהדרת גם
          במכשיר הנייד שלכם!
        </p>

        <div className="text-sm text-gray-500 mt-4" dir="rtl">
          <p>בינתיים, אנא התחברו דרך מחשב כדי ליהנות מהחוויה המלאה של Miel.</p>
        </div>
      </div>
    </div>
  );
}
