"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    names: "שירה ואביב",
    content:
      "ניסינו כמה אפליקציות, אבל במיאל משהו היה שונה. השיחה בינינו הייתה קלילה ואמיתית מההתחלה. היום אנחנו חוגגים שנה יחד.",
  },
  {
    id: 2,
    names: "אלון ומיכל",
    content:
      "כבר כמעט ויתרתי על כל עניין ההיכרויות באפליקציות. במיאל הכרתי את מיכל תוך ימים ספורים, ומאז אנחנו לא נפרדים. מתחתנים בקיץ הקרוב.",
  },
  {
    id: 3,
    names: "גבריאל ואור",
    content:
      "במיאל הרגשתי שמישהו באמת מקשיב למה שאני מחפש. הכרתי את אור, ומהשיחה הראשונה זה הרגיש נכון. היום אנחנו חולמים יחד קדימה.",
  },
  {
    id: 4,
    names: "רותם ודניאל",
    content:
      "חיפשנו משהו אמיתי, בלי משחקים. מיאל חיברה בינינו בדיוק בדרך שחיפשנו. מהיום הראשון ידענו שיש פה משהו מיוחד.",
  },
  {
    id: 5,
    names: "טל ועומר",
    content:
      "עם מיאל הרגשתי בפעם הראשונה שמבינים אותי. עומר ואני התחברנו מייד, והיום אנחנו בונים את החיים המשותפים שלנו ביחד.",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const storyDuration = 7000;

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % testimonials.length);
    setProgress(0);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setProgress(0);
      setIsAutoPlaying(false);
      setIsPaused(true);

      // חזרה לאוטו פליי אחרי 8 שניות
      setTimeout(() => {
        setIsAutoPlaying(true);
        setIsPaused(false);
      }, 8000);
    },
    [currentIndex]
  );

  // ניהול progress bar
  useEffect(() => {
    if (!isAutoPlaying || isPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / storyDuration) * 50;
      });
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, currentIndex]);

  // מעבר בין testimonials
  useEffect(() => {
    if (!isAutoPlaying || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      next();
    }, storyDuration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [next, isAutoPlaying, isPaused]);

  // ניקוי intervals בסגירה
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    };
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <section className="py-20 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/5 to-amber-700/5 mix-blend-overlay" />

      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative">
            מה המשתמשים שלנו אומרים
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </h2>
        </motion.div>

        <div className="relative w-full overflow-hidden mx-auto max-w-4xl">
          <div
            className="relative min-h-[300px] flex items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 200, damping: 25 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                }}
                className="w-full"
              >
                <div className="backdrop-blur-sm bg-white/5 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                  <div className="p-8 md:p-10 relative">
                    <div className="absolute top-6 right-8 text-7xl text-amber-400/20 font-serif">
                      ״
                    </div>

                    <div className="pt-6 relative">
                      <motion.p
                        className="text-xl md:text-2xl font-medium leading-relaxed text-white mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        {testimonials[currentIndex].content}
                      </motion.p>

                      <div className="flex items-center justify-start">
                        <div>
                          <motion.p
                            className="text-lg font-semibold text-amber-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                          >
                            {testimonials[currentIndex].names}
                          </motion.p>
                          <motion.div
                            className="text-sm text-white/60 mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                          >
                            מצאו אהבה במיאל
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress indicators */}
          <div className="mt-8">
            <div className="flex items-center justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className="relative rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{
                    width: currentIndex === index ? "60px" : "30px",
                    height: "6px",
                    backgroundColor:
                      currentIndex === index
                        ? "rgba(245, 158, 11, 0.2)"
                        : "rgba(255, 255, 255, 0.1)",
                  }}
                  aria-label={`עבור לעדות ${index + 1}`}
                >
                  {index === currentIndex && (
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual navigation arrows */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() =>
              goTo(
                (currentIndex - 1 + testimonials.length) % testimonials.length
              )
            }
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label="עדות קודמת"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            onClick={() => goTo((currentIndex + 1) % testimonials.length)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label="עדות הבאה"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
