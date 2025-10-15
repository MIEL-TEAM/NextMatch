"use client";

import React, { useState } from "react";
import { Button, Chip } from "@nextui-org/react";
import { MessageCircleIcon, MapPinIcon, ShareIcon } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { toggleLikeMember } from "@/app/actions/likeActions";
import { Member } from "@prisma/client";
import { toast } from "react-toastify";
import LikeButton from "./LikeButton";
import { getToastStyle } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";

type ProfileHeaderProps = {
  member: Member & {
    user?: {
      oauthVerified?: boolean;
      emailVerified?: Date | null;
    };
  };
  userId: string;
  likeIds: string[];
  onLikeToggle?: (userId: string, hasLiked: boolean) => void;
};

export default function ProfileHeader({
  member,
  userId,
  likeIds = [],
  onLikeToggle,
}: ProfileHeaderProps) {
  const [hasLiked, setHasLiked] = useState(likeIds.includes(member.userId));
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const router = useRouter();
  async function toggleLike() {
    setLoading(true);
    try {
      const result = await toggleLikeMember(member.userId, hasLiked);

      if (result.success) {
        setHasLiked(!hasLiked);
        onLikeToggle?.(member.userId, hasLiked);
        toast.success(hasLiked ? "הוסר מהאהובים" : "נוסף לאהובים", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      } else if (result.alreadyLiked) {
        toast.error(`כבר עשית לייק ל${member.name}`, {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      } else {
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } catch (error) {
      console.log(error);
      setHasLiked(likeIds.includes(member.userId));
      toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
        style: {
          ...getToastStyle(),
          textAlign: "center",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  const preventLinkAction = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  async function handleShare() {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `בדוק את הפרופיל של ${member.name}`,
          text: `מצאתי פרופיל מעניין: ${member.name}`,
          url: `/members/${member.userId}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/members/${member.userId}`
        );
        toast.success("קישור לפרופיל הועתק", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("שגיאה בשיתוף הפרופיל", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <div className="flex flex-col gap-2 items-center md:items-start">
        <div className="flex items-center gap-2" dir="rtl">
          <h1 className="text-3xl font-bold">{member.name || "משתמש"}</h1>
          {member.user?.oauthVerified && (
            <MdVerified className="text-blue-500 inline w-7 h-7" />
          )}
        </div>

        {/* Verification Badge */}
        {(member.user?.oauthVerified || member.user?.emailVerified) && (
          <div className="flex gap-2" dir="rtl">
            {member.user?.oauthVerified && (
              <Chip
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-blue-50 border-blue-200 border",
                  content: "text-blue-600 font-semibold",
                }}
                startContent={<MdVerified className="text-blue-500 w-4 h-4" />}
              >
                מאומת
              </Chip>
            )}
            {!member.user?.oauthVerified && member.user?.emailVerified && (
              <Chip
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-gray-50 border-gray-200 border",
                  content: "text-gray-600 font-semibold",
                }}
              >
                אימייל מאומת
              </Chip>
            )}
          </div>
        )}

        <div className="flex gap-2 items-center text-default-500">
          <MapPinIcon size={16} />
          <span>
            {member.city} {member.country}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            color="warning"
            variant="solid"
            startContent={<MessageCircleIcon size={18} />}
            className="w-full"
            onPress={() => router.push(`/members/${userId}/chat`)}
          >
            צור קשר
          </Button>
          <div onClick={preventLinkAction}>
            <div className="flex items-center bg-red-200 justify-center p-1 rounded-lg border border-default-200">
              <LikeButton
                loading={loading}
                toggleLike={toggleLike}
                hasLiked={hasLiked}
              />
            </div>
          </div>
          <Button
            color="default"
            variant="light"
            isIconOnly
            aria-label="שיתוף"
            onPress={handleShare}
            isLoading={isSharing}
          >
            <ShareIcon size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-grow"></div>
    </div>
  );
}
