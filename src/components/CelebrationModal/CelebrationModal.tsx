"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import Icon from "@/lib/table/Icon";
import Confetti from "react-confetti";
import NextImage from "next/image";
import { useRouter } from "next/navigation";

import { getCelebrationConfig } from "./config";
import type { CelebrationType, CelebrationData, CelebrationModalProps } from "./types";

export default function CelebrationModal({
  isOpen,
  onClose,
  type,
  data,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const router = useRouter();

  const config = getCelebrationConfig(type, data, router);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && config.sound) {
      const audio = new Audio(config.sound);
      audio.play().catch(() => {});
    }
  }, [isOpen, config.sound]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && windowDimensions.width > 0 && (
            <Confetti
              width={windowDimensions.width}
              height={windowDimensions.height}
              recycle={false}
              numberOfPieces={200}
              colors={config.confettiColors}
              gravity={0.3}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
              }}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.3, opacity: 0, rotateY: 180 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.6,
              }}
              className={`
                relative max-w-md w-full mx-4 sm:mx-auto
                bg-gradient-to-br ${config.colors.secondary}
                rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden
                border-2 border-white/20
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.colors.primary}`}
              />

              <div className="p-6 sm:p-8 text-center">
                {type === "mutual-like" ? (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="relative flex justify-center items-center h-40 mb-4 sm:mb-6"
                  >
                    {/* Current user — tilted left */}
                    <div className="absolute w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden shadow-xl border-2 border-white -rotate-6 translate-x-[-44px] sm:translate-x-[-52px] z-0">
                      <NextImage
                        src={data?.currentUserImage ?? "/images/user.png"}
                        alt="אתה"
                        fill
                        className="object-cover"
                        unoptimized={!!data?.currentUserImage}
                      />
                    </div>
                    {/* Matched user — tilted right */}
                    <div className="absolute w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden shadow-xl border-2 border-white rotate-6 translate-x-[44px] sm:translate-x-[52px] z-10">
                      <NextImage
                        src={data?.userImage ?? "/images/user.png"}
                        alt={data?.userName ?? ""}
                        fill
                        className="object-cover"
                        unoptimized={!!data?.userImage}
                      />
                    </div>
                    {/* Heart badge */}
                    <div className={`absolute z-20 w-11 h-11 rounded-full bg-gradient-to-br ${config.colors.primary} flex items-center justify-center shadow-lg ring-[3px] ring-white`}>
                      <Icon name="heart" type="sol" className="size-5 bg-white" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className={`
                      inline-flex items-center justify-center
                      w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4 sm:mb-6
                      bg-gradient-to-br ${config.colors.primary}
                      text-white shadow-lg
                    `}
                  >
                    <div className="scale-75 sm:scale-100">{config.icon}</div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                >
                  {config.emoji}
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${config.colors.accent} leading-tight`}
                >
                  {config.title}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 leading-relaxed"
                >
                  {config.subtitle}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="space-y-2.5 sm:space-y-3"
                >
                  {config.actions?.primary && (
                    <Button
                      onClick={() => {
                        config.actions?.primary?.action();
                        onClose();
                      }}
                      className={`
                        w-full bg-gradient-to-r ${config.colors.primary}
                        text-white font-medium py-2.5 sm:py-3 rounded-2xl sm:rounded-xl text-sm sm:text-base
                        sm:hover:scale-105 active:scale-95 transition-transform
                        shadow-lg sm:hover:shadow-xl
                      `}
                      startContent={config.actions.primary.icon}
                    >
                      {config.actions.primary.text}
                    </Button>
                  )}

                  {config.actions?.secondary && (
                    <Button
                      variant="bordered"
                      onClick={() => {
                        config.actions?.secondary?.action();
                        onClose();
                      }}
                      className={`
                        w-full border-2 ${config.colors.accent}
                        sm:hover:bg-white/50 active:bg-white/30 transition-colors
                        rounded-2xl sm:rounded-xl py-2.5 sm:py-3 text-sm sm:text-base
                      `}
                    >
                      {config.actions.secondary.text}
                    </Button>
                  )}

                  <Button
                    variant="light"
                    onClick={onClose}
                    className="w-full text-gray-600 hover:text-gray-800 mt-3 sm:mt-4 text-sm"
                  >
                    ✨ סגור
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    type: CelebrationType;
    data?: CelebrationData;
  }>({
    isOpen: false,
    type: "achievement",
  });

  const showCelebration = (type: CelebrationType, data?: CelebrationData) => {
    setCelebration({ isOpen: true, type, data });
  };

  const closeCelebration = () => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  };

  return { celebration, showCelebration, closeCelebration };
}
