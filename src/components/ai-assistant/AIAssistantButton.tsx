"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";
import { AIChatModal } from "./AIChatModal";

interface AIAssistantButtonProps {
  userId: string;
  isPremium: boolean;
}

export function AIAssistantButton({
  userId,
  isPremium,
}: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsight, setHasNewInsight] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip on first visit
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("ai-assistant-tooltip-seen");
    if (!hasSeenTooltip) {
      setTimeout(() => setShowTooltip(true), 2000);
      setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("ai-assistant-tooltip-seen", "true");
      }, 8000);
    }
  }, []);

  // Check for new insights from the AI
  useEffect(() => {
    const checkForInsights = async () => {
      try {
        const response = await fetch(
          `/api/ai-assistant/insights?userId=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.hasInsights) {
            setHasNewInsight(true);
          }
        }
      } catch (error) {
        console.error("Failed to check insights:", error);
      }
    };

    if (!isOpen && userId) {
      // Check immediately
      checkForInsights();

      // Check every 5 minutes
      const interval = setInterval(checkForInsights, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewInsight(false);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-6 z-50"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute bottom-full left-0 mb-3 whitespace-nowrap"
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                    היי! אני כאן לעזור לך למצוא אהבה 💕
                    <div className="absolute top-full left-6 -mt-1">
                      <div className="border-8 border-transparent border-t-orange-500"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Badge for new insights */}
            {hasNewInsight && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                1
              </motion.div>
            )}

            {/* Main Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-amber-500/50 transition-shadow group"
              aria-label="פתח עוזר AI"
            >
              {/* Pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-600"
              />

              {/* Icon */}
              <motion.div
                animate={hasNewInsight ? { rotate: [0, -10, 10, -10, 0] } : {}}
                transition={{
                  duration: 0.5,
                  repeat: hasNewInsight ? Infinity : 0,
                  repeatDelay: 3,
                }}
                className="relative z-10"
              >
                <FiMessageCircle className="w-7 h-7" />
              </motion.div>

              {/* Sparkle effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-ping delay-75"></div>
                <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-150"></div>
              </motion.div>
            </motion.button>

            {/* AI Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-orange-600 whitespace-nowrap"
            >
              🧠 AI עוזר
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <AIChatModal
            userId={userId}
            isPremium={isPremium}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
