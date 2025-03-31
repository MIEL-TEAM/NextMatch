import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
}

export function ConfettiEffect({
  isActive,
  duration = 3000,
}: ConfettiEffectProps) {
  useEffect(() => {
    if (isActive) {
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      (function frame() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FBBF24", "#fcd34d"],
          zIndex: 9999,
        });

        requestAnimationFrame(frame);
      })();
    }
  }, [isActive, duration]);

  return null; // This is a behavior-only component with no UI
}
