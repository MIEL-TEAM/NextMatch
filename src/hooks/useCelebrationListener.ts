"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { CelebrationType } from "@/components/CelebrationModal";
import { newLikeToast } from "@/components/NotificationToast";

interface MutualMatchData {
  matchedUser: {
    name: string;
    image?: string;
    userId: string;
  };
  currentUserGender: "male" | "female";
  type: string;
  timestamp: string;
}

interface SmartMatchData {
  matchScore: number;
  matchReason: string;
  userName: string;
}

export function useCelebrationListener(
  userId: string | undefined,
  showCelebration: (type: CelebrationType, data?: any) => void
) {
  useEffect(() => {
    if (!userId) return;

    // השתמש בערוץ קיים - אל תיצור חדש אם כבר קיים
    const channel =
      pusherClient.channel(`private-${userId}`) ||
      pusherClient.subscribe(`private-${userId}`);

    // 💕 לייק הדדי
    channel.bind("mutual-match", (data: MutualMatchData) => {
      console.log("🎉 Mutual match detected!", data);

      // טקסט דינמי לפי מגדר - כולל התאמה של כל המילים
      const genderText = data.currentUserGender === "male" ? "אתה" : "את";
      const loveText =
        data.currentUserGender === "male" ? "אחד את השנייה" : "אחת את השני";

      showCelebration("mutual-like", {
        userName: data.matchedUser.name,
        userImage: data.matchedUser.image,
        matchedUserId: data.matchedUser.userId, // 🎯 ID של המשתמש המתאים
        customTitle: "🎉 מזל טוב! התאמה הדדית!",
        customSubtitle: `${genderText} ו${data.matchedUser.name} אוהבים ${loveText}! 💕`,
      });

      // 🔊 צליל חגיגי (אופציונלי)
      try {
        const audio = new Audio("/sounds/celebration.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // אם הצליל נכשל, לא נעשה כלום
        });
      } catch {
        // אם אין קובץ צליל, לא נעשה כלום
      }
    });

    // 💗 לייק רגיל (טוסט)
    channel.bind(
      "like:new",
      (data: { name: string; image: string | null; userId: string }) => {
        console.log("👍 Regular like received!", data);
        newLikeToast(data.name, data.image, data.userId);
      }
    );

    // 🧠 התאמה חכמה (אופציונלי)
    channel.bind("smart-match", (data: SmartMatchData) => {
      console.log("🎯 Smart match found!", data);

      showCelebration("smart-match", {
        userName: data.userName,
        matchScore: data.matchScore,
        customTitle: "🧠 התאמה חכמה נמצאה!",
        customSubtitle: `${data.matchScore}% התאמה עם ${data.userName}! ${data.matchReason}`,
      });
    });

    // 📩 הודעה ראשונה
    channel.bind("first-message", (data: { userName: string }) => {
      console.log("📩 First message sent!", data);

      showCelebration("first-message", {
        userName: data.userName,
        customTitle: "📩 הודעה ראשונה נשלחה!",
        customSubtitle: `השיחה עם ${data.userName} התחילה! 🚀`,
      });
    });

    // ⭐ שדרוג פרופיל
    channel.bind("profile-boost", () => {
      console.log("⭐ Profile boosted!");

      showCelebration("profile-boost", {
        customTitle: "⭐ הפרופיל שלך מושלם!",
        customSubtitle: "יותר אנשים יראו אותך עכשיו! 🌟",
      });
    });

    // 🏆 הישג כללי
    channel.bind(
      "achievement",
      (data: { title: string; description: string }) => {
        console.log("🏆 Achievement unlocked!", data);

        showCelebration("achievement", {
          customTitle: data.title,
          customSubtitle: data.description,
        });
      }
    );

    return () => {
      // רק נתק את האירועים, אל תבטל את המנוי לערוץ (שמשמש גם hooks אחרים)
      channel.unbind("mutual-match");
      channel.unbind("like:new");
      channel.unbind("smart-match");
      channel.unbind("first-message");
      channel.unbind("profile-boost");
      channel.unbind("achievement");
      // אל תקרא ל-pusherClient.unsubscribe - זה יכול להפריע להוקים אחרים
    };
  }, [userId, showCelebration]);

  return null; // Hook לא מחזיר UI
}

export const celebrationTriggers = {
  // 🧠 התאמה חכמה
  smartMatch: async (userId: string, matchData: SmartMatchData) => {
    // ניתן לקרוא מ-smartMatchActions.ts
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`private-${userId}`, "smart-match", matchData);
  },

  // 📩 הודעה ראשונה
  firstMessage: async (userId: string, userName: string) => {
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`private-${userId}`, "first-message", {
      userName,
    });
  },

  // ⭐ שדרוג פרופיל
  profileBoost: async (userId: string) => {
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`private-${userId}`, "profile-boost", {});
  },

  // 🏆 הישג כללי
  achievement: async (userId: string, title: string, description: string) => {
    const { pusherServer } = await import("@/lib/pusher");
    await pusherServer.trigger(`private-${userId}`, "achievement", {
      title,
      description,
    });
  },
};
