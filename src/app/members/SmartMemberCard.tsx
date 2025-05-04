"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { Member } from "@prisma/client";
import { useState, useEffect, useRef } from "react";
import {
  toggleLikeMember,
  fetchCurrentUserLikeIds,
} from "../actions/likeActions";
import MemberImageCarousel from "@/components/MemberImageCarousel";
import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type SmartMemberCardProps = {
  member: Member;
  memberPhotos?: Array<{ url: string; id: string }>;
};

export default function SmartMemberCard({
  member,
  memberPhotos = [],
}: SmartMemberCardProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Array<{ url: string; id: string }>>([]);
  const trackInteractions = useInteractionTracking(member.userId);
  const router = useRouter();
  const processedPhotosRef = useRef(false);
  const likeCheckedRef = useRef(false);

  useEffect(() => {
    async function checkLikeStatus() {
      if (likeCheckedRef.current) return;

      try {
        const likedIds = await fetchCurrentUserLikeIds();
        if (likedIds.includes(member.userId)) {
          setHasLiked(true);
        }
        likeCheckedRef.current = true;
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    }

    checkLikeStatus();
  }, [member.userId]);

  useEffect(() => {
    if (processedPhotosRef.current) return;
    processedPhotosRef.current = true;

    const processedPhotos: Array<{ url: string; id: string }> = [];

    if (member.image) {
      processedPhotos.push({ url: member.image, id: "profile" });
    }

    if (memberPhotos && memberPhotos.length > 0) {
      memberPhotos.forEach((photo) => {
        if (photo && photo.url) {
          if (!processedPhotos.some((p) => p.url === photo.url)) {
            processedPhotos.push(photo);
          }
        }
      });
    }

    setPhotos(processedPhotos);
  }, [member.userId, member.image, memberPhotos]);

  async function toggleLike(e: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setLoading(true);

    try {
      await toggleLikeMember(member.userId, hasLiked);
      await trackInteractions.like();

      setHasLiked(!hasLiked);

      toast.success(hasLiked ? "הוסר מהאהובים" : "נוסף לאהובים", {
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Like toggle error:", error);
      toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleProfileClick = () => {
    trackInteractions.profileClick();
    router.push(`/members/${member.userId}`);
  };

  const renderCardContent = (imageUrl: string, isPriority: boolean = false) => (
    <Card
      isPressable
      className="w-full h-full shadow-lg hover:shadow-xl transition-shadow"
      onPress={handleProfileClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          isZoomed
          alt={member.name}
          src={transformImageUrl(imageUrl) || "/images/user.png"}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out transform group-hover:scale-105"
          removeWrapper
          loading={isPriority ? "eager" : "lazy"}
        />

        <div
          className="absolute top-3 right-3 z-10"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <LikeButton
            loading={loading}
            toggleLike={toggleLike}
            hasLiked={hasLiked}
          />
        </div>

        <div className="absolute top-2 left-3 z-10">
          <PresenceDot member={member} />
        </div>

        <CardFooter className="flex justify-between bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient w-full rounded-b-lg p-2">
          <div className="flex flex-col text-white">
            <span className="font-semibold text-sm">
              {member.name}, {calculateAge(member.dateOfBirth)}
            </span>
            <span className="text-xs">{member.city}</span>
          </div>

          <div className="px-2 pb-1 rounded-full bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27]">
            <span className="text-xs text-white font-medium">התאמה חכמה</span>
          </div>
        </CardFooter>
      </div>
    </Card>
  );

  if (photos.length <= 1) {
    const defaultImage =
      photos.length === 1 ? photos[0].url : "/images/user.png";
    return renderCardContent(defaultImage, true);
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl">
      <MemberImageCarousel images={photos} prioritizeFirstImage={true}>
        {(currentImage, isPriority) =>
          renderCardContent(currentImage.url, isPriority)
        }
      </MemberImageCarousel>
    </div>
  );
}
