"use client";

import React, { useState } from "react";
import { toggleLikeMember } from "@/app/actions/likeActions";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";
import MobileProfileView from "@/components/MobileProfileView";

type MobileProfileWrapperProps = {
  member: any;
  userId: string;
  isOwnProfile: boolean;
  initialLiked: boolean;
};

export default function MobileProfileWrapper({
  member,
  userId,
  isOwnProfile,
  initialLiked,
}: MobileProfileWrapperProps) {
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLikeToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleLikeMember(member.userId, hasLiked);

      if (result.success) {
        setHasLiked(!hasLiked);
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
      toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
        style: {
          ...getToastStyle(),
          textAlign: "center",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileProfileView
      member={member}
      userId={userId}
      isOwnProfile={isOwnProfile}
      hasLiked={hasLiked}
      onLikeToggle={handleLikeToggle}
      likeLoading={loading}
    />
  );
}
