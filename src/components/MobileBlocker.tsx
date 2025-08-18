"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function MobileBlocker() {
  return (
    <div className="lg:hidden fixed inset-0 z-50 h-screen w-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/images/couple.jpg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-6">
          ✨ גרסת מובייל בדרך ✨
        </h1>

        <p className="text-lg text-gray-200 leading-relaxed">
          כרגע האפליקציה זמינה לשימוש רק במחשב.
          <br />
          בקרוב תשוחרר גרסת מובייל מלאה, עם חוויה מותאמת במיוחד לטלפון 📱
        </p>
      </motion.div>
    </div>
  );
}
