"use client";

import { FC } from "react";
import Link from "next/link";

const MielFooter: FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-400">
              אנשים יחידים, הקשיבו: מיאל היא אפליקציית ההיכרויות היחידה שבאמת
              דואגת לכם
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              עם מיאל, המרחב הדיגיטלי להיכרויות נראה שונה לגמרי. בניגוד
              לאפליקציות אחרות שגורמות להתמכרות, אנחנו מציעים חוויה שמתמקדת
              באיכות במקום בכמות. בין אם אתם מחפשים קשר רציני, חברויות חדשות, או
              סתם להכיר אנשים מעניינים, מיאל כאן כדי לעזור לכם למצוא חיבורים
              אמיתיים.
            </p>
            <p className="text-gray-300 leading-relaxed">
              מיאל היא לא עוד אפליקציית היכרויות. המטרה שלנו היא לעזור לכם למצוא
              התאמות איכותיות שבאמת מתאימות לכם, ולא לגרום לכם להעביר שעות
              בסוויפים אינסופיים. בין אם אתם מהקהילה הגאה, מחפשים קשר רציני, או
              רוצים להרחיב את המעגל החברתי, מיאל כאן בשבילכם.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                © 2024 מיאל בע״מ, כל הזכויות שמורות.
              </p>
            </div>

            <nav>
              <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    שאלות נפוצות
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety-tips"
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    טיפים לבטיחות
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    מדיניות פרטיות
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    צור קשר
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MielFooter;
