"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    {
      title: "אנחנו עובדים על האפליקציה הניידת",
      content:
        "Miel נולדה מתוך אהבה – ואנחנו רוצים להעניק לך את החוויה הכי טובה שיש. כרגע, האפליקציה לניידים שלנו בפיתוח.",
      footer:
        "נשמח לראות אותך בגרסת המחשב – ולצאת יחד איתך למסע של היכרות משמעותית ואמיתית",
    },
    {
      title: "האפליקציה הניידת בדרך אליכם",
      content:
        "ב־Miel אנחנו מאמינים שאהבה מתחילה בחיבור אמיתי, ואנחנו עובדים על האפליקציה הניידת כדי שתוכלו ליהנות בקרוב.",
      footer: "בינתיים, מחכים לך בגרסת המחשב עם כל החוויה המלאה",
    },
    {
      title: "עובדים במרץ על גרסת המובייל",
      content:
        "אנחנו מזמינים אותך להיכנס אלינו מהמחשב בינתיים, עד שנשלים את פיתוח האפליקציה הניידת.",
      footer:
        "כל צוות Miel כאן בשבילך – לא סתם עוד אפליקציה, אלא בית לאנשים שמחפשים קשר אמיתי",
    },
    {
      title: "חווית Miel המלאה מגיעה בקרוב לנייד",
      content:
        "Miel זה מקום שבו חיבור אמיתי קודם לכל, ואנחנו משקיעים בגרסת המובייל שתהיה מושלמת.",
      footer: "בינתיים, תוכל למצוא את האהבה בגרסת המחשב המלאה שלנו",
    },
  ];

  const buttonMessages = [
    "נתראה במחשב",
    "מחכים לך בדסקטופ",
    "נפגש שם בקרוב",
    "נשמח לראותך",
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Rotate messages every 7 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 7000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(interval);
    };
  }, [messages.length]);

  if (!isMobile) return null;

  const currentMessage = messages[messageIndex];
  const buttonMessage = buttonMessages[messageIndex];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Background with the couple image */}
      <div className="absolute inset-0">
        <Image
          src="/images/couple.png"
          alt="Happy couple"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent"></div>
      </div>

      {/* Content matching the homepage image */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <div className="max-w-xs mx-auto px-6 text-center">
          {/* App Icon */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/icons/Logo.png"
              alt="Miel Logo"
              width={60}
              height={60}
              className="rounded-full bg-white/30 p-2 shadow-lg"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4" dir="rtl">
            <div className="relative inline-block">
              <div className="absolute -bottom-2 right-0 h-3 bg-amber-400 w-full -z-10" />
              <span>הדייט האחרון שלך.</span>
            </div>
          </h1>

          <div className="text-white mb-8 space-y-3 min-h-[150px]" dir="rtl">
            <p className="text-base text-amber-200">{currentMessage.title}</p>
            <p className="text-sm">{currentMessage.content}</p>
            <p className="text-sm text-amber-100">{currentMessage.footer}</p>
          </div>

          <button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-full shadow-md text-base font-medium cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() =>
              alert(
                "אנחנו עובדים על האפליקציה הניידת, נשמח לראותך בגרסת המחשב!"
              )
            }
          >
            {buttonMessage}
          </button>
        </div>
      </div>
    </div>
  );
}
