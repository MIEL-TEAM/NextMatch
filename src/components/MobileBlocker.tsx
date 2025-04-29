"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentTagline, setCurrentTagline] = useState(0);

  // Taglines in the style of the homepage
  const taglines = [
    "המקום להכיר אנשים אמיתיים",
    "ליצור חיבורים משמעותיים",
    "מעבר לשיחות שטחיות",
    "להתחבר באמת",
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Rotate taglines every 3 seconds
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(interval);
    };
  }, [taglines.length]);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50" />
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-200 to-orange-200 mix-blend-overlay" />

      {/* Animated Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          className="absolute left-10 top-10 w-64 h-64 rounded-full bg-gradient-to-r from-amber-200/20 to-orange-300/20 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{
            x: [0, -30, 30, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          className="absolute right-10 bottom-10 w-64 h-64 rounded-full bg-gradient-to-l from-rose-300/20 to-amber-300/20 blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="https://miel-love.com/images/icons/Logo.png"
              alt="Miel"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-4xl font-bold text-center mb-2 text-orange-600"
            style={{ direction: "rtl" }}
          >
            <div className="relative inline-block">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -bottom-1 right-0 h-3 bg-amber-200 -z-10"
              />
              <span>הדייט האחרון שלך.</span>
            </div>
          </motion.h1>

          {/* Taglines */}
          <div className="h-8 relative w-64 my-6">
            {taglines.map((tagline, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: currentTagline === index ? 1 : 0,
                  y: currentTagline === index ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-x-0 ${
                  currentTagline === index ? "block" : "hidden"
                }`}
              >
                <p
                  className="text-lg text-amber-500 font-light text-center"
                  style={{ direction: "rtl" }}
                >
                  {tagline}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 max-w-md mx-auto shadow-xl border border-amber-100"
        >
          <h2
            className="text-2xl font-bold mb-4 text-orange-600 text-center"
            dir="rtl"
          >
            מיועד למסך רחב
          </h2>

          <div className="prose prose-amber text-center mb-6" dir="rtl">
            <p>
              <span className="font-medium">Miel</span> מציעה חוויית דייטינג
              עשירה ומלאה המתוכננת למסכים גדולים.
            </p>
            <p className="text-gray-700">
              כרגע החוויה האופטימלית שלנו מיועדת למחשב נייח או נייד, כדי להביא
              לך את
              <span className="text-orange-500 font-semibold">
                {" "}
                החיבורים המדויקים ביותר{" "}
              </span>
              בקלות ובמהירות.
            </p>
          </div>

          <div className="relative">
            <div className="flex justify-center mb-5">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                <Image
                  src="/images/couple-small.jpg"
                  alt="Couple"
                  width={200}
                  height={133}
                  className="rounded-lg shadow-md"
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg mb-6"
            dir="rtl"
          >
            <p className="text-orange-600 font-bold text-lg">בקרוב במובייל!</p>
            <p className="text-sm text-gray-700">
              אנחנו עובדים במרץ על גרסת מובייל שתעניק לך את אותה חוויה נהדרת גם
              בנייד.
            </p>
          </motion.div>

          <motion.div
            className="text-center text-sm text-gray-500"
            dir="rtl"
            whileHover={{ scale: 1.01 }}
          >
            <p>בינתיים, אנא התחבר דרך מחשב כדי ליהנות מהחוויה המלאה של Miel.</p>
          </motion.div>
        </motion.div>

        {/* Bottom animated button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-8"
        >
          <motion.a
            href="https://miel-love.com"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(251, 146, 60, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-full shadow-lg font-medium relative overflow-hidden"
          >
            <span className="relative z-10">לאתר הראשי</span>
            <motion.div
              className="absolute top-0 -left-10 w-5 h-full bg-white/20 transform rotate-12 -skew-x-12"
              animate={{ left: ["100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
