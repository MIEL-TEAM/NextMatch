"use client";

import { motion } from "framer-motion";

export default function HeartLoading() {
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
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 0.5,
        },
        opacity: {
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 2,
        },
      },
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center"
      >
        <motion.svg viewBox="0 0 32 32" className="w-24 h-24">
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-lg text-gray-700"
        >
          בטעינה...
        </motion.p>
      </motion.div>
    </div>
  );
}
