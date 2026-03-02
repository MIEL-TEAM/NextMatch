"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { CelebrationType } from "@/components/CelebrationModal";
import useInvitationStore, { type Invitation } from "./useInvitationStore";
import { useRouter } from "next/navigation";

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
  const { show: showInvitation } = useInvitationStore();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const channel =
      pusherClient.channel(`private-${userId}`) ||
      pusherClient.subscribe(`private-${userId}`);

    channel.bind("mutual-match", (data: MutualMatchData) => {
      const genderText = data.currentUserGender === "male" ? "אתה" : "את";
      const loveText =
        data.currentUserGender === "male" ? "אחד את השנייה" : "אחת את השני";

      showCelebration("mutual-like", {
        userName: data.matchedUser.name,
        userImage: data.matchedUser.image,
        matchedUserId: data.matchedUser.userId,
        customTitle: "🎉 מזל טוב! התאמה הדדית!",
        customSubtitle: `${genderText} ו${data.matchedUser.name} אוהבים ${loveText}! 💕`,
      });

      try {
        const audio = new Audio("/sounds/celebration.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (error) {
        console.error("Error playing celebration sound:", error);
      }
    });

    channel.bind("smart-match", (data: SmartMatchData) => {
      showCelebration("smart-match", {
        userName: data.userName,
        matchScore: data.matchScore,
        customTitle: "🧠 התאמה חכמה נמצאה!",
        customSubtitle: `${data.matchScore}% התאמה עם ${data.userName}! ${data.matchReason}`,
      });
    });

    channel.bind("first-message", (data: { userName: string }) => {
      showCelebration("first-message", {
        userName: data.userName,
        customTitle: "📩 הודעה ראשונה נשלחה!",
        customSubtitle: `השיחה עם ${data.userName} התחילה! 🚀`,
      });
    });

    channel.bind("profile-boost", () => {
      showCelebration("profile-boost", {
        customTitle: "⭐ הפרופיל שלך מושלם!",
        customSubtitle: "יותר אנשים יראו אותך עכשיו! 🌟",
      });
    });

    channel.bind(
      "achievement",
      (data: { title: string; description: string }) => {
        showCelebration("achievement", {
          customTitle: data.title,
          customSubtitle: data.description,
        });
      }
    );

    channel.bind(
      "match:online",
      async (data: {
        userId: string;
        name: string;
        image: string | null;
        videoUrl?: string | null;
      }) => {
        // Real-time delivery: Load invitation from backend to get the database ID
        // This ensures we can mark it as seen/accepted/dismissed
        try {
          const res = await fetch("/api/invitations");
          const invitations = await res.json();
          
          // Find the invitation for this sender
          const matchingInvitation = invitations.find(
            (inv: any) => inv.sender.id === data.userId
          );

          if (matchingInvitation) {
            const invitation: Invitation = {
              id: matchingInvitation.id, // Use database ID
              type: "chat",
              userId: data.userId,
              image: data.image,
              videoUrl: data.videoUrl || null,
              name: data.name,
              title: `${data.name} זמינה לשיחה`,
              onAction: async () => {
                // Mark as accepted on backend
                await fetch(`/api/invitations/${matchingInvitation.id}/accept`, {
                  method: "POST",
                }).catch((e) => console.error("Failed to accept invitation:", e));
                
                router.push(`/members/${data.userId}/chat`);
              },
            };

            showInvitation(invitation);
          }
        } catch (error) {
          console.error("Failed to load invitation:", error);
        }
      }
    );

    return () => {
      channel.unbind("mutual-match");
      channel.unbind("smart-match");
      channel.unbind("first-message");
      channel.unbind("profile-boost");
      channel.unbind("achievement");
      channel.unbind("match:online");
    };
  }, [userId, showCelebration, showInvitation, router]);

  return null;
}

export const celebrationTriggers = {
  smartMatch: async (userId: string, matchData: SmartMatchData) => {
    const { pusherServer } = await import("@/lib/pusher-server");
    await pusherServer.trigger(`private-${userId}`, "smart-match", matchData);
  },

  firstMessage: async (userId: string, userName: string) => {
    const { pusherServer } = await import("@/lib/pusher-server");
    await pusherServer.trigger(`private-${userId}`, "first-message", {
      userName,
    });
  },

  profileBoost: async (userId: string) => {
    const { pusherServer } = await import("@/lib/pusher-server");
    await pusherServer.trigger(`private-${userId}`, "profile-boost", {});
  },

  achievement: async (userId: string, title: string, description: string) => {
    const { pusherServer } = await import("@/lib/pusher-server");
    await pusherServer.trigger(`private-${userId}`, "achievement", {
      title,
      description,
    });
  },
};
