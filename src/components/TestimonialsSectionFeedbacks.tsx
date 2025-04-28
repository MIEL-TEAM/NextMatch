"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialsSection = () => {
  // Testimonial data with unique content for each testimonial
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<number>(0); // -1 left, 0 none, 1 right

  // Navigate to next testimonial
  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  // Jump to specific testimonial
  const goToTestimonial = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setProgress(0);
      setIsAutoPlaying(false);

      // Resume auto playing after 8 seconds of inactivity
      const timeout = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 8000);

      return () => clearTimeout(timeout);
    },
    [currentIndex]
  );

  // Progress animation and auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const storyDuration = 7000; // 7 seconds per testimonial
    const updateInterval = 30; // Smoother 30ms updates
    const progressIncrement = (updateInterval / storyDuration) * 100;

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Reset progress when reaching 100%
        }
        return prev + progressIncrement;
      });
    }, updateInterval);

    // Story advancement
    const storyTimer = setInterval(() => {
      nextTestimonial();
      setProgress(0); // Reset progress on testimonial change
    }, storyDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(storyTimer);
    };
  }, [nextTestimonial, isAutoPlaying]);

  // Animation variants for smoother transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className="py-20 relative overflow-hidden" dir="rtl">
      {/* Beautiful gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/5 to-amber-700/5 mix-blend-overlay"></div>

      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        {/* Section heading with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative">
            מה המשתמשים שלנו אומרים
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </h2>
        </motion.div>

        {/* Testimonials container */}
        <div className="relative w-full overflow-hidden mx-auto max-w-4xl">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
              }}
              className="testimonial-container"
            >
              <div className="backdrop-blur-sm bg-white/5 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                <div className="p-8 md:p-10">
                  {/* Quote mark */}
                  <div className="absolute top-6 right-8 text-7xl text-amber-400/20 font-serif">
                    ״
                  </div>

                  {/* Testimonial content */}
                  <div className="pt-6 relative">
                    <motion.p
                      className="text-xl md:text-2xl font-medium leading-relaxed text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      {testimonials[currentIndex].content}
                    </motion.p>

                    {/* Couple info */}
                    <div className="mt-8 flex items-center justify-start gap-4">
                      <div>
                        <motion.p
                          className="text-lg font-medium text-amber-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                        >
                          {testimonials[currentIndex].names}
                        </motion.p>
                        <motion.div
                          className="text-xs text-white/50"
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

          {/* Progress indicators */}
          <div className="mt-8">
            <div className="flex-1 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 focus:outline-none"
                    style={{
                      width: currentIndex === index ? "60px" : "30px",
                      backgroundColor:
                        currentIndex === index
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {index === currentIndex && (
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-600"
                        style={{
                          width: `${progress}%`,
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes slow-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-slow-spin {
          animation: slow-spin 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
