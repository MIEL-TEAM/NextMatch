"use client";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";

const MielFooter: FC = () => {
  return (
    <footer
      className="bg-black/90 text-white py-12 mt-32 relative overflow-hidden"
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

          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="text-sm text-gray-400 mt-[5vh]"><span>Lorem Ipsum:</span>
                <br></br>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                <br></br>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                <p className="text-sm text-gray-400 mt-[5vh]">
                  © 2024 <span className="text-amber-400 font-medium">Miel</span>
                  , כל הזכויות שמורות.
                </p> </div>

            </div>

            <nav>
              <ul className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">

                <li className="flex flex-col">
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.7vh]">
                    Company
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.35vh]">
                    About us
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    Contacts
                  </div>
                </li>
                <li className="flex flex-col">
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.7vh]">
                    Support
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.35vh]">
                    FAQ
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    EA Settings
                  </div>
                </li>
                <li className="flex flex-col">
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.7vh]">
                    Something
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors !mb-[0.35vh]">
                    About us
                  </div>
                  <div className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    Contacts
                  </div>
                </li>
              </ul>
            </nav>
          </div>
      </div>
    </footer>
  );
};

export default MielFooter;
