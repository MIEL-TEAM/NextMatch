"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

export default function AnimatedBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on initial load
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setIsMobile(checkMobile());
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // צמצום דרסטי של אלמנטים
  const numElements = useMemo(() => (isMobile ? 1 : 2), [isMobile]);

  // אנימציות פשוטות יותר
  const simpleTransition = {
    duration: 40, // האטה
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "linear",
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50" />

      {!isMobile && (
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-amber-200 to-orange-200 mix-blend-overlay" />
      )}

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: numElements }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (dimensions.width || 1000),
              y: Math.random() * (dimensions.height || 1000),
              opacity: 0.03,
              scale: 0.5,
            }}
            animate={{
              x: [null, Math.random() * (dimensions.width || 1000)],
              y: [null, Math.random() * (dimensions.height || 1000)],
              opacity: [0.03, 0.01, 0.03],
            }}
            transition={simpleTransition}
            className="absolute w-32 h-32 rounded-full bg-amber-300/10 blur-2xl"
          />
        ))}
      </div>
    </div>
  );
}
