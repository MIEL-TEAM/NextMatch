import Icon from "@/lib/table/Icon";
import type { CelebrationType, CelebrationConfig, CelebrationData } from "./types";

export function getCelebrationConfig(
  type: CelebrationType,
  data?: CelebrationData,
  router?: { push: (href: string) => void }
): CelebrationConfig {
  const configs: Record<CelebrationType, CelebrationConfig> = {
    "mutual-like": {
      icon: <Icon name="heart" className="size-16 bg-white" />,
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
              router?.push(`/members/${data.matchedUserId}/chat`);
            } else {
              router?.push(`/messages`);
            }
          },
          icon: <Icon name="comment" className="size-4 bg-white" />,
        },
      },
    },

    "smart-match": {
      icon: <Icon name="sparkles" className="size-16 bg-white" />,
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
          icon: <Icon name="sparkles" className="size-4 bg-white" />,
        },
      },
    },

    "first-message": {
      icon: <Icon name="comment" className="size-16 bg-white" />,
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
      icon: <Icon name="star-sharp" className="size-16 bg-white" />,
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
      icon: <Icon name="users" className="size-16 bg-white" />,
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
      icon: <Icon name="bolt" className="size-16 bg-white" />,
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
}
