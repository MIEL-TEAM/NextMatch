"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { BsFacebook, BsInstagram, BsTiktok } from "react-icons/bs";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";
import { Button } from "@nextui-org/react";

const MielFooter = () => {
  return (
    <footer
      className="bg-white text-gray-900 py-16 px-8"
      style={{ fontFamily: "Wix Madefor Text, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Left Section - Logo, Description and CTA */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/images/icons/Logo.png"
                alt="Miel Logo"
                width={40}
                height={40}
              />
              <h1 className="text-4xl font-bold">Miel</h1>
            </div>

            {/* Description */}
            <p className="text-[28px] max-w-72 font-semibold mb-8 leading-tight text-gray-700">
            אנחנו מחברים אנשים לקשר אנושי אמיתי אונליין.
            </p>

            {/* CTA Button */}
            <Link href="/login">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 px-16 rounded transition-colors duration-300 mb-8 text-lg">
                הצטרף למיאל
              </Button>
            </Link>
          </div>

          {/* האפליקציה Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xl  font-semibold mb-8 text-gray-700">
              האפליקציה
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  איך זה עובד
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  סיפורי הצלחה
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  מסלולי פרימיום
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  הורדה לאייפון/אנדרואיד
                </Link>
              </li>
            </ul>
          </div>

          {/* משאבים Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-8 text-gray-700">
              משאבים
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  שאלות ותשובות
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  בלוג וטיפים לדייטים
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  תמיכה טכנית
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  צור קשר
                </Link>
              </li>
            </ul>
          </div>

          {/* מידע משפטי Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold mb-8 text-gray-700">
              מידע משפטי
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link
                  href="/safety-tips"
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  אבטחת מידע
                </Link>
              </li>
            </ul>
          </div>

          {/* Empty space for alignment */}
          <div className="lg:col-span-2"></div>
        </div>

        {/* Social Media Icons */}
        <div className="flex gap-6 mb-8">
          <Link
            href="https://www.instagram.com/miel.dating?igsh=a2xybDhqbHd3a3h5&utm_source=qr"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <BsInstagram size={20} />
          </Link>
          <Link
            href="https://www.facebook.com/miel.dating"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
                  <BsFacebook size={20} />
          </Link>
          <Link
            href="https://www.tiktok.com/@miel.dating"
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <BsTiktok size={20} />
          </Link>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <FaCcVisa size={40} className="text-gray-800" />
          <FaCcMastercard size={40} className="text-gray-800" />
          <FaCcAmex size={40} className="text-gray-800" />
          <span className="text-gray-800 font-medium text-lg px-3 py-1 border border-gray-300 rounded">
            ישראכרט
          </span>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-sm">
          © 2025{" "}
          <span className="text-amber-600 font-semibold">Miel</span> Inc. כל
          הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

export default MielFooter;