"use client";

import { useDisableScrollOnlyIfNotNeeded } from "@/hooks/useDisableScroll";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export type MielHomePageProps = {
  session: string;
};

export default function MielHomePage({ session }: MielHomePageProps) {
  useDisableScrollOnlyIfNotNeeded();
  const [animationComplete, setAnimationComplete] = useState(false);

  const taglines = [
    "המקום להכיר אנשים אמיתיים",
    "ליצור חיבורים משמעותיים",
    "מעבר לשיחות שטחיות",
    "להתחבר באמת",
  ];

  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    if (animationComplete) {
      const interval = setInterval(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animationComplete, taglines.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      onAnimationComplete={() => setAnimationComplete(true)}
      className="flex flex-col justify-center items-center min-h-screen text-black inset-0 px-6 sm:px-12 bg-gradient-to-b from-amber-50 to-orange-50"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5 }}
          className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-amber-400"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-orange-400"
        />
      </div>

      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="flex flex-col items-center text-center z-10 mt-8 sm:mt-0"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <Image
              src="/images/icons/Logo.png"
              width={80}
              height={80}
              alt="Miel Logo"
              className="object-contain w-16 h-16 sm:w-20 sm:h-20"
            />
          </motion.div>
        </div>

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-3xl sm:text-2xl md:text-7xl font-bold mt-6 bg-gradient-to-r from-amber-500 via-orange-400 to-orange-500 bg-clip-text text-transparent"
        >
          ברוכים הבאים ל-Miel
        </motion.h1>

        <div className="h-10 sm:h-12 mt-4 mb-6 w-full relative">
          {taglines.map((tagline, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: currentTagline === index ? 1 : 0,
                y: currentTagline === index ? 0 : 20,
              }}
              transition={{ duration: 0.5 }}
              className={`w-full text-center absolute inset-x-0 ${
                currentTagline === index ? "block" : "hidden"
              }`}
            >
              <p
                className="text-lg sm:text-xl text-gray-700 inline-block"
                style={{ direction: "rtl" }}
              >
                {tagline}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="flex flex-col gap-5 mt-4 mb-8 max-w-4xl text-center z-10 w-full"
      >
        <motion.h2
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-2xl font-semibold text-orange-700"
          style={{ direction: "rtl" }}
        >
          למה לבחור מיאל?
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full px-2">
          {[
            {
              icon: "✨",
              title: "חווית היכרויות חדשנית",
              description: "ממשק אינטואיטיבי ומעוצב להיכרויות משמעותיות",
              color: "from-orange-400 to-amber-500",
              delay: 1.0,
            },
            {
              icon: "🔒",
              title: "אבטחה ופרטיות מתקדמים",
              description: "הגנה מלאה על המידע האישי שלך",
              color: "from-amber-400 to-yellow-500",
              delay: 1.2,
            },
            {
              icon: "❤️",
              title: "התאמות איכותיות",
              description: "אלגוריתם חכם שמבין את ההעדפות שלך",
              color: "from-red-400 to-orange-400",
              delay: 1.4,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: feature.delay }}
              whileHover={{
                y: -5,
                boxShadow: "0 15px 30px rgba(255, 165, 0, 0.2)",
                scale: 1.03,
              }}
              className="backdrop-blur-md bg-white/70 rounded-xl p-5 text-center border border-orange-200 shadow-lg overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-out" />

              <motion.div
                className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl bg-gradient-to-br ${feature.color}`}
                whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="drop-shadow-md">{feature.icon}</span>
              </motion.div>

              <h3
                className="text-lg font-bold text-orange-700 mb-2"
                style={{ direction: "rtl" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-gray-700" style={{ direction: "rtl" }}>
                {feature.description}
              </p>

              <motion.div
                className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl bg-gradient-to-tl from-transparent to-orange-200/40"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {session !== "guest" ? (
        <Link href="/members" className="z-10">
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(255, 165, 0, 0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full mt-4 shadow-lg text-lg sm:text-xl font-medium flex items-center group overflow-hidden relative"
          >
            <span className="relative z-10">המשך</span>

            <motion.div
              className="relative z-10 mr-2"
              animate={{ x: [0, 5, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>

            <motion.div
              className="absolute top-0 -left-20 w-10 h-full bg-white/20 transform rotate-12 -skew-x-12"
              animate={{ left: ["100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        </Link>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4 w-full max-w-md z-10"
        >
          <Link href="/login" className="w-full">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(255, 165, 0, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-lg sm:text-xl font-medium w-full flex items-center justify-center relative overflow-hidden group"
            >
              <span className="relative z-10">התחברות</span>
              <motion.div
                className="relative z-10 mr-2"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>

              <motion.div
                className="absolute top-0 -left-20 w-10 h-full bg-white/20 transform rotate-12 -skew-x-12"
                animate={{ left: ["100%"] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          </Link>
          <Link href="/register" className="w-full">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 20px rgba(255, 165, 0, 0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              className="backdrop-blur-sm bg-white/80 border-2 border-orange-400 text-orange-500 px-6 py-3 rounded-full shadow-sm text-lg sm:text-xl font-medium w-full flex items-center justify-center"
            >
              <span>הרשמה</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="flex flex-col items-center mt-6 mb-4 z-10"
      >
        <div className="flex flex-row-reverse gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <motion.svg
              key={i}
              whileHover={{
                scale: 1.2,
                rotate: 5,
                filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))",
              }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 text-amber-400 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </motion.svg>
          ))}
        </div>
        <motion.p
          whileHover={{ scale: 1.05 }}
          className="text-xs text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full"
          style={{ direction: "rtl" }}
        >
          הצטרפו ל-10,000+ משתמשים מרוצים
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
