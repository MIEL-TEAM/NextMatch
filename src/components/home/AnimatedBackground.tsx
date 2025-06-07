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

  // Reduce number of animated elements on mobile
  const numElements = useMemo(() => (isMobile ? 2 : 4), [isMobile]);

  // Use simpler animations for mobile
  const mobileTransition = {
    duration: 25,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "linear",
  };

  const desktopTransition = {
    duration: 30,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "linear",
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50" />
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-200 to-orange-200 mix-blend-overlay" />

      {/* Reduce complexity for mobile */}
      {!isMobile && (
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={desktopTransition}
            className="absolute left-20 top-20 w-96 h-96 rounded-full bg-gradient-to-r from-amber-200/10 to-orange-300/10 blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{
              x: [0, -80, 80, 0],
              y: [0, 80, -80, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              ...desktopTransition,
              duration: 35,
            }}
            className="absolute right-20 bottom-20 w-96 h-96 rounded-full bg-gradient-to-l from-rose-300/10 to-amber-300/10 blur-3xl"
          />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: numElements }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              opacity: isMobile ? 0.1 : 0.2 + Math.random() * 0.2,
              scale: isMobile ? 0.3 : 0.4 + Math.random() * 0.4,
            }}
            animate={{
              x: [null, Math.random() * dimensions.width],
              y: [null, Math.random() * dimensions.height],
              opacity: [null, isMobile ? 0.05 : 0.1 + Math.random() * 0.1],
              scale: [null, isMobile ? 0.2 : 0.3 + Math.random() * 0.3],
            }}
            transition={
              isMobile
                ? mobileTransition
                : {
                    duration: 20 + Math.random() * 20,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "linear",
                  }
            }
            className={`absolute w-24 h-24 rounded-full 
              ${
                i % 3 === 0
                  ? "bg-amber-300/5"
                  : i % 3 === 1
                    ? "bg-orange-300/5"
                    : "bg-rose-300/5"
              } 
              blur-xl`}
          />
        ))}
      </div>
    </div>
  );
}
