"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HomePageWrapperProps = {
  children: React.ReactNode;
};

export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const heartDrawingVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0.2,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 1.2,
          ease: "easeInOut",
        },
        opacity: {
          duration: 0.6,
        },
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gradient-to-b from-orange-50 to-amber-100 z-50 flex flex-col justify-center items-center"
        >
          <div className="text-center px-4">
            <motion.svg
              viewBox="0 0 32 32"
              className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 mx-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454
                C30,20.335,16,28.261,16,28.261z"
                stroke="#FF8A00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(255, 138, 0, 0.3)"
                variants={heartDrawingVariants}
                initial="hidden"
                animate="visible"
              />
            </motion.svg>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-4 text-xl md:text-2xl lg:text-3xl font-bold text-orange-600 mb-2"
            >
              ברוכים הבאים
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-md md:text-lg lg:text-xl text-orange-800 max-w-md md:max-w-lg lg:max-w-xl mx-auto"
            >
              לדור החדש של הדייטינג
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
