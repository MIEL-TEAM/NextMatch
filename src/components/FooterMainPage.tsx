"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { BsFacebook, BsInstagram, BsTiktok } from "react-icons/bs";

const MielFooter = () => {
  return (
    <>
      <footer
        className="bg-white text-gray-900 border-t border-gray-200"
        style={{ fontFamily: "Wix Madefor Text, sans-serif" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16" dir="rtl">
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src="/images/icons/logo-m.png"
                  alt="Miel Logo"
                  width={28}
                  height={28}
                />
                <span className="text-2xl font-bold">Miel</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                מיאל היא אפליקציית ההכרויות שמביאה חיבורים אמיתיים לעולם
                הדיגיטלי. אצלנו לא תמצאו סווייפים אינסופיים אלא היכרות אמיתית,
                קשרים איכותיים וחוויה שמכבדת אתכם ואת הזמן שלכם.
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://www.instagram.com/miel.dating?igsh=a2xybDhqbHd3a3h5&utm_source=qr"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <BsInstagram size={24} color="#000" />
                </Link>
                <Link
                  href="https://www.instagram.com/miel.dating?igsh=a2xybDhqbHd3a3h5&utm_source=qr"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <BsFacebook size={24} color="#000" />
                </Link>
                <Link
                  href="https://www.instagram.com/miel.dating?igsh=a2xybDhqbHd3a3h5&utm_source=qr"
                  className="text-gray-400 hover:text-amber-500 transition-colors"
                >
                  <BsTiktok size={24} color="#000" />
                </Link>
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-gray-900 font-semibold mb-6 text-base tracking-wide uppercase">
                האפליקציה
              </h3>
              <ul className="space-y-4 text-base">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    איך זה עובד
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    סיפורי הצלחה
                  </Link>
                </li>
                <li>
                  <Link
                    href="/premium"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    מסלולי פרימיום
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    הורדה לאייפון/אנדרואיד
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-left">
              <h3 className="text-gray-900 font-semibold mb-6 text-base tracking-wide uppercase">
                משאבים
              </h3>
              <ul className="space-y-4 text-base">
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    שאלות ותשובות
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    בלוג וטיפים לדייטים
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    תמיכה טכנית
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    צור קשר
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-left">
              <h3 className="text-gray-900 font-semibold mb-6 text-base tracking-wide uppercase">
                מידע משפטי
              </h3>
              <ul className="space-y-4 text-base">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    מדיניות פרטיות
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety-tips"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    אבטחת מידע
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              © 2025 <span className="text-amber-600 font-semibold">Miel</span>{" "}
              Inc. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MielFooter;
