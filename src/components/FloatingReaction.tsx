"use client";

import { motion } from "framer-motion";

interface FloatingReactionProps {
  name: string;
  onDismiss: () => void;
}

export default function FloatingReaction({ name, onDismiss }: FloatingReactionProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -52 }}
      transition={{ duration: 0.72, ease: "easeOut" }}
      onAnimationComplete={onDismiss}
      className="absolute top-[40%] left-1/2 -translate-x-1/2 z-[55] pointer-events-none select-none"
    >
      <span
        dir="rtl"
        className="text-[15px] text-center font-semibold text-white whitespace-nowrap"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}
      >
        {`אהבת את ${name} 💗`}
      </span>
    </motion.div>
  );
}
