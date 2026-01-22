"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { Heart, MessageCircle, Sparkles, Star, Users, Zap } from "lucide-react";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";

export type CelebrationType =
  | "mutual-like" // לייק הדדי
  | "smart-match" // התאמה חכמה
  | "first-message" // הודעה ראשונה
  | "profile-boost" // שדרוג פרופיל
  | "new-connection" // חיבור חדש
  | "achievement"; // הישג כללי

// 🎨 נתוני חגיגה לכל סוג
interface CelebrationConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sound?: string;
  confettiColors: string[];
  actions?: {
    primary?: {
      text: string;
      action: () => void;
      icon?: React.ReactNode;
    };
    secondary?: {
      text: string;
      action: () => void;
    };
  };
}

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  data?: {
    userName?: string;
    userImage?: string;
    matchedUserId?: string; 
    matchScore?: number;
    customTitle?: string;
    customSubtitle?: string;
  };
}

// 🎪 קונפיגורציות לכל סוג חגיגה
const getCelebrationConfig = (
  type: CelebrationType,
  data?: CelebrationModalProps["data"],
  router?: any
): CelebrationConfig => {
  const configs: Record<CelebrationType, CelebrationConfig> = {
    "mutual-like": {
      icon: <Heart className="w-16 h-16" />,
      title: data?.customTitle || `🎉 מזל טוב! התאמה הדדית!`,
      subtitle:
        data?.customSubtitle ||
        `את ו${data?.userName || "המשתמש"} אוהבים אחד את השני! 💕`,
      emoji: "💖",
      colors: {
        primary: "from-orange-500 to-red-500",
        secondary: "from-orange-100 to-red-100",
        accent: "text-orange-600",
      },
      confettiColors: ["#f97316", "#ea580c", "#dc2626", "#b91c1c"],
      actions: {
        primary: {
          text: "💌 שלח הודעה ראשונה",
          action: () => {
            if (data?.matchedUserId) {
              // עבור לצ'אט ישירות עם המשתמש המתאים
              router?.push(`/members/${data.matchedUserId}/chat`);
            } else {
              router?.push(`/messages`);
            }
          },
          icon: <MessageCircle className="w-4 h-4" />,
        },
        secondary: {
          text: "👀 צפה בפרופיל",
          action: () => {
            if (data?.matchedUserId) {
              // עבור לפרופיל ישירות של המשתמש המתאים
              router?.push(`/members/${data.matchedUserId}`);
            }
          },
        },
      },
    },

    "smart-match": {
      icon: <Sparkles className="w-16 h-16" />,
      title: data?.customTitle || `🧠 התאמה חכמה מצאה!`,
      subtitle:
        data?.customSubtitle ||
        `${data?.matchScore || 85}% התאמה עם ${data?.userName || "משתמש מיוחד"}! 🎯`,
      emoji: "✨",
      colors: {
        primary: "from-orange-500 to-amber-500",
        secondary: "from-orange-100 to-amber-100",
        accent: "text-orange-600",
      },
      confettiColors: ["#f97316", "#f59e0b", "#eab308", "#d97706"],
      actions: {
        primary: {
          text: "💫 צפה בהתאמה",
          action: () => router?.push("/smart-matches"),
          icon: <Sparkles className="w-4 h-4" />,
        },
      },
    },

    "first-message": {
      icon: <MessageCircle className="w-16 h-16" />,
      title: data?.customTitle || `📩 הודעה ראשונה נשלחה!`,
      subtitle:
        data?.customSubtitle ||
        `השיחה עם ${data?.userName || "המשתמש"} התחילה! 🚀`,
      emoji: "💬",
      colors: {
        primary: "from-blue-500 to-cyan-500",
        secondary: "from-blue-100 to-cyan-100",
        accent: "text-blue-600",
      },
      confettiColors: ["#3b82f6", "#06b6d4", "#0891b2", "#0e7490"],
    },

    "profile-boost": {
      icon: <Star className="w-16 h-16" />,
      title: data?.customTitle || `⭐ הפרופיל שלך מושלם!`,
      subtitle: data?.customSubtitle || `יותר אנשים יראו אותך עכשיו! 🌟`,
      emoji: "🌟",
      colors: {
        primary: "from-amber-500 to-orange-500",
        secondary: "from-amber-100 to-orange-100",
        accent: "text-amber-600",
      },
      confettiColors: ["#f59e0b", "#f97316", "#ea580c", "#d97706"],
    },

    "new-connection": {
      icon: <Users className="w-16 h-16" />,
      title: data?.customTitle || `🤝 חיבור חדש נוצר!`,
      subtitle:
        data?.customSubtitle ||
        `${data?.userName || "מישהו חדש"} הצטרף לרשת שלך! 👥`,
      emoji: "🤝",
      colors: {
        primary: "from-green-500 to-teal-500",
        secondary: "from-green-100 to-teal-100",
        accent: "text-green-600",
      },
      confettiColors: ["#10b981", "#14b8a6", "#0d9488", "#0f766e"],
    },

    achievement: {
      icon: <Zap className="w-16 h-16" />,
      title: data?.customTitle || `🏆 הישג חדש!`,
      subtitle: data?.customSubtitle || `כל הכבוד! השגת משהו מיוחד! 🎊`,
      emoji: "🏆",
      colors: {
        primary: "from-amber-500 to-yellow-500",
        secondary: "from-amber-100 to-yellow-100",
        accent: "text-amber-600",
      },
      confettiColors: ["#f59e0b", "#eab308", "#facc15", "#fde047"],
    },
  };

  return configs[type];
};

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

  // 🎊 אפקט קונפטי
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // עצור קונפטי אחרי 4 שניות
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // נקה קונפטי מיד כשנסגר
      setShowConfetti(false);
    }
  }, [isOpen]);

  // 🔊 צליל (אופציונלי)
  useEffect(() => {
    if (isOpen && config.sound) {
      const audio = new Audio(config.sound);
      audio.play().catch(() => {
        // אם הצליל נכשל, לא נעשה כלום
      });
    }
  }, [isOpen, config.sound]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 🎊 קונפטי */}
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

          {/* 🌑 רקע כהה */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* 🎪 מודל החגיגה */}
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
              {/* ✨ אפקט זוהר עליון */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.colors.primary}`}
              />

              {/* 🎯 תוכן המודל */}
              <div className="p-6 sm:p-8 text-center">
                {/* 🎭 אייקון מרכזי */}
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
                  <div className="scale-75 sm:scale-100">
                    {config.icon}
                  </div>
                </motion.div>

                {/* 🎊 אמוג'י מרחף */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                >
                  {config.emoji}
                </motion.div>

                {/* 📝 כותרת */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-3 ${config.colors.accent} leading-tight`}
                >
                  {config.title}
                </motion.h2>

                {/* 📄 תת-כותרת */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-sm sm:text-base text-gray-700 mb-6 sm:mb-8 leading-relaxed"
                >
                  {config.subtitle}
                </motion.p>

                {/* 🎮 כפתורי פעולה */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="space-y-2.5 sm:space-y-3"
                >
                  {/* כפתור ראשי */}
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

                  {/* כפתור משני */}
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

                  {/* כפתור סגירה */}
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

// 🎯 Hook נוח לשימוש
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    type: CelebrationType;
    data?: CelebrationModalProps["data"];
  }>({
    isOpen: false,
    type: "achievement",
  });

  const showCelebration = (
    type: CelebrationType,
    data?: CelebrationModalProps["data"]
  ) => {
    setCelebration({ isOpen: true, type, data });
  };

  const closeCelebration = () => {
    setCelebration((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    celebration,
    showCelebration,
    closeCelebration,
  };
}
