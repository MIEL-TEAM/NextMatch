"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

const MielFooter: FC = () => {
  return (
    <footer
      className="bg-black/90 text-white py-12 mt-32 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400/80 via-amber-500/80 to-amber-600/80"></div>

      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-black/50 px-5 py-3 rounded-full backdrop-blur-sm border border-amber-500/20">
            <Image
              src="/images/icons/Logo.png"
              alt="Miel Heart"
              width={32}
              height={32}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
            />
            <span className="text-2xl font-bold text-white">
              <span className="text-amber-400">M</span>iel
            </span>
          </div>
        </div>

        <div className="mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-400">
              רווקים ורווקות, הקשיבו: מיאל היא אפליקציית ההיכרויות היחידה שבאמת
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

        {/* New colorful divider */}
        <div className="relative py-8 mb-8">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 flex items-center">
            <div className="relative">
              <Image
                src="/images/icons/Logo.png"
                alt="Miel Heart"
                width={48}
                height={48}
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="relative w-5 h-5 mr-2">
                <Image
                  src="/images/icons/Logo.png"
                  alt="Miel Heart"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-gray-400">
                © 2024 <span className="text-amber-400 font-medium">Miel</span>
                , כל הזכויות שמורות.
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
