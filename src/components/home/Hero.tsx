"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type HeroSectionProps = {
  session: string;
};

export default function HeroSection({ session }: HeroSectionProps) {
  const [currentTagline, setCurrentTagline] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  const taglines = [
    "המקום להכיר אנשים אמיתיים",
    "ליצור חיבורים משמעותיים",
    "מעבר לשיחות שטחיות",
    "להתחבר באמת",
  ];

  useEffect(() => {
    if (animationComplete) {
      const interval = setInterval(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animationComplete, taglines.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/couple.png"
            alt="Couple connection"
            fill
            className="object-cover z-[1] brightness-125 contrast-[0.95]"
            priority
            sizes="100vw"
            style={{
              objectPosition: "center 25%",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-[2]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent z-[2]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 to-amber-700/10 mix-blend-overlay z-[2]"></div>
        </div>
      </motion.div>

      <div className="relative z-10 h-full">
        <div className="w-full bg-gradient-to-b from-black/80 to-transparent pt-8 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 lg:px-24 flex flex-col items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full md:w-3/4 lg:w-2/3"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col items-end"
              >
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white text-right mb-2"
                  style={{ direction: "rtl" }}
                  onAnimationComplete={() => setAnimationComplete(true)}
                >
                  <div className="relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: 1.3 }}
                      className="absolute -bottom-2 sm:-bottom-3 right-0 h-3 sm:h-5 bg-amber-400 -z-10"
                    />
                    <div className="whitespace-nowrap">הדייט האחרון שלך.</div>
                  </div>
                </motion.h1>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Centered Taglines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="h-12 relative w-64 sm:w-96">
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
                  className="text-lg sm:text-xl md:text-2xl text-amber-200 font-light drop-shadow-md text-center whitespace-nowrap"
                  style={{ direction: "rtl" }}
                >
                  {tagline}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 w-full px-4 sm:px-6 md:px-16 lg:px-24 pb-20 sm:pb-24">
          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="md:w-1/2 mb-8 md:mb-0 order-2 md:order-1"
            >
              {session === "guest" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex flex-col sm:flex-row gap-4"
                  style={{ direction: "rtl" }}
                >
                  <Link href="/register">
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                        y: -2,
                        boxShadow: "0 15px 30px -10px rgba(251, 146, 60, 0.3)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-xl text-base sm:text-lg font-medium relative overflow-hidden"
                    >
                      <span className="relative z-10">התחל עכשיו</span>
                      <motion.div
                        className="absolute top-0 -left-20 w-10 h-full bg-white/20 transform rotate-12 -skew-x-12"
                        animate={{ left: ["100%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatDelay: 4,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.button>
                  </Link>
                  <Link href="/about">
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.15)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full sm:w-auto bg-transparent text-white border-2 border-white/60 px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-lg backdrop-blur-sm text-base sm:text-lg font-medium"
                    >
                      למה Miel?
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  style={{ direction: "rtl" }}
                >
                  <Link href="/members">
                    <motion.button
                      whileHover={{
                        scale: 1.03,
                        y: -2,
                        boxShadow: "0 15px 30px -10px rgba(251, 146, 60, 0.3)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full shadow-xl text-lg sm:text-xl font-medium relative overflow-hidden"
                    >
                      <span className="relative z-10">גלה. תתחבר. תתאהב.</span>
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
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="md:w-2/5 order-1 md:order-2"
            >
              <div
                className="text-right rounded-2xl overflow-hidden shadow-2xl"
                style={{ direction: "rtl" }}
              >
                <div className="bg-gradient-to-r from-amber-500/90 to-orange-600/90 px-5 py-3">
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                  >
                    ליצור חיבורים משמעותיים
                  </motion.h2>
                </div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="bg-white/15 backdrop-blur-lg p-5 border-t border-white/20"
                >
                  <p className="text-white text-base sm:text-lg leading-relaxed">
                    ב-Miel אנחנו מאמינים שכל אחד שמחפש אהבה צריך למצוא אותה.
                    האלגוריתם החכם שלנו מחבר בין אנשים שבאמת מתאימים, כדי שתוכלו
                    לצאת לדייטים משמעותיים - ולא להישאר באפליקציה.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 2, duration: 1 },
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
