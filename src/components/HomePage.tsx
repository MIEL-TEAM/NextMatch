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
        className="flex flex-col items-center text-center z-10"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="flex flex-col gap-5 mt-4 mb-8 max-w-lg text-center z-10"
      >
        <h2 className="text-xl font-semibold text-orange-700">
          למה לבחור מיאל?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-gray-700">
          <div className="flex items-center bg-white bg-opacity-70 p-3 rounded-lg shadow-sm">
            <span className="bg-amber-100 p-2 rounded-full mr-2">✨</span>
            <span>חווית היכרויות חדשנית</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-70 p-3 rounded-lg shadow-sm">
            <span className="bg-amber-100 p-2 rounded-full mr-2">🔒</span>
            <span>אבטחה ופרטיות מתקדמים</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-70 p-3 rounded-lg shadow-sm">
            <span className="bg-amber-100 p-2 rounded-full mr-2">❤️</span>
            <span>התאמות איכותיות</span>
          </div>
        </div>
      </motion.div>

      {session !== "guest" ? (
        <Link href="/members" className="z-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-full mt-4 shadow-lg text-lg sm:text-xl font-medium flex items-center"
          >
            <span>המשך</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-lg sm:text-xl font-medium w-full flex items-center justify-center"
            >
              <span>התחברות</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </Link>
          <Link href="/register" className="w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white border-2 border-orange-400 text-orange-500 px-6 py-3 rounded-full shadow-sm text-lg sm:text-xl font-medium w-full flex items-center justify-center"
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

      {/* Social proof section - fixing RTL issues */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="flex flex-col items-center mt-6 mb-4 z-10"
      >
        <div className="flex flex-row-reverse gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-5 h-5 text-amber-400 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
        <p className="text-xs text-gray-600" style={{ direction: "rtl" }}>
          הצטרפו ל-10,000+ משתמשים מרוצים
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 text-sm text-gray-600 text-center max-w-xs sm:max-w-md z-10"
      >
        המטרה שלנו היא לייצר קשרים אמיתיים - לא להתמכר לאפליקציה
      </motion.p>
    </motion.div>
  );
}
