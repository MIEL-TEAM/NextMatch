"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AnimatedBackground = () => {
  const [backgroundCircles, setBackgroundCircles] = useState<any[]>([]);

  useEffect(() => {
    const circles = Array.from({ length: 6 }).map((_, index) => ({
      id: `circle-${index}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 300 + 100}px`,
      height: `${Math.random() * 300 + 100}px`,
      xMovement: Math.random() * 50 - 25,
      yMovement: Math.random() * 50 - 25,
      duration: Math.random() * 10 + 20,
    }));

    setBackgroundCircles(circles);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 -z-10">
      {backgroundCircles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full bg-orange-400/5"
          style={{
            top: circle.top,
            left: circle.left,
            width: circle.width,
            height: circle.height,
          }}
          animate={{
            x: [0, circle.xMovement],
            y: [0, circle.yMovement],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
