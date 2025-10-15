"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { formatDistance } from "@/lib/locationUtils";
import { Card, CardFooter } from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { toggleLikeMember } from "@/app/actions/likeActions";
import MemberImageCarousel from "@/components/MemberImageCarousel";
import { VolumeX, Volume2, Camera, Video, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";
import VerifiedRibbon from "@/components/VerifiedRibbon";

interface MemberCardProps {
  member: Member & {
    distance?: number;
    user?: {
      oauthVerified?: boolean;
    };
  };
  likeIds: string[];
  memberPhotos?: Array<{ url: string; id: string }>;
  memberVideos?: Array<{ url: string; id: string }>;
  onLike?: (memberId: string, isLiked: boolean) => void;
  isPriority?: boolean;
}

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
  memberVideos = [],
  onLike,
  isPriority = false,
}: MemberCardProps) {
  const [hasLiked, setHasLiked] = useState<boolean>(
    likeIds.includes(member.userId)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    if (memberVideos.length > 0 && !activeVideo) {
      setActiveVideo(memberVideos[0].url);
    }
  }, [memberVideos, activeVideo]);

  const age = useMemo(
    () => calculateAge(member.dateOfBirth),
    [member.dateOfBirth]
  );
  const distanceText = useMemo(
    () =>
      member.distance !== undefined ? formatDistance(member.distance) : null,
    [member.distance]
  );

  useEffect(() => {
    setVideoError(false);
  }, [activeVideo]);

  const toggleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!hasLiked && likeIds.includes(member.userId)) {
        toast.error(`כבר עשית לייק ל${member.name}`, {
          style: getToastStyle(),
        });
        return;
      }

      setLoading(true);

      try {
        const result = await toggleLikeMember(member.userId, hasLiked);

        if (result.success) {
          const newLikedState = !hasLiked;
          setHasLiked(newLikedState);

          if (onLike) {
            onLike(member.userId, newLikedState);
          }
        } else if (result.alreadyLiked) {
          toast.error(`כבר עשית לייק ל${member.name}`, {
            style: getToastStyle(),
          });
        } else {
          toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
            style: getToastStyle(),
          });
        }
      } catch (error) {
        console.error("Like toggle error:", error);
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
          style: getToastStyle(),
        });
      } finally {
        setLoading(false);
      }
    },
    [member.userId, hasLiked, onLike, member.name, likeIds]
  );

  const handleMouseEnter = useCallback(() => {
    if (memberVideos.length > 0 && activeVideo) {
      setShowVideo(true);
    }
  }, [memberVideos.length, activeVideo]);

  const handleMouseLeave = useCallback(() => {
    setShowVideo(false);
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setShowVideo(false);
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  }, []);

  const renderCardContent = useCallback(
    (imageUrl: string, isPriority: boolean) => (
      <Card
        as={Link}
        href={`/members/${member.userId}`}
        isPressable
        className="w-full h-full shadow-lg hover:shadow-xl transition-shadow"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-lg group">
          {memberVideos.length > 0 && (
            <span className="absolute top-2 right-14 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md z-50">
              חדש 🎬
            </span>
          )}

          {showVideo && activeVideo && !videoError && (
            <div className="absolute inset-0 z-40 overflow-hidden">
              <video
                src={activeVideo}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="none"
                onError={handleVideoError}
              />
            </div>
          )}

          <Image
            alt={member.name}
            src={transformImageUrl(imageUrl) || "/images/user.png"}
            className={`w-full h-full object-cover transition-all duration-200 ease-in-out transform group-hover:scale-105 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "low"}
            priority={isPriority}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABAgEAf6qL9wAAAABJRU5ErkJggg=="
          />

          {/* OAuth Verification Ribbon */}
          {member.user?.oauthVerified && <VerifiedRibbon />}

          <div className="absolute top-2 left-2 z-50 flex gap-1.5 items-center">
            <LikeButton
              loading={loading}
              toggleLike={toggleLike}
              hasLiked={hasLiked}
              aria-label={hasLiked ? "בטל לייק" : "הוסף לייק"}
            />

            {memberVideos.length > 0 && showVideo && (
              <button
                onClick={toggleMute}
                className="bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-lg ring-2 ring-blue-400/60 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/80"
                aria-label={isMuted ? "בטל השתקה" : "השתק וידאו"}
                type="button"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
                )}
              </button>
            )}
          </div>

          {/* Bottom-left media counters + location like dating.com */}
          <div className="absolute bottom-2 left-2 z-50 flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[11px] leading-none font-medium">
                {Math.max(memberPhotos.length, member.image ? 1 : 0)}
              </span>
            </div>
            {memberVideos.length > 0 && (
              <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                <Video className="w-3.5 h-3.5" />
                <span className="text-[11px] leading-none font-medium">
                  {memberVideos.length}
                </span>
              </div>
            )}
            {member.distance !== undefined && (
              <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] leading-none font-medium">
                  {distanceText}
                </span>
              </div>
            )}
          </div>

          {/* Removed centered strip */}
          <CardFooter className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 px-2 pb-2" />
        </div>

        {/* Title and description - Beautiful card footer */}
        <div className="px-3 py-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-bold text-[16px] text-gray-900 dark:text-white truncate">
              {member.name}, {age}
            </h3>
            <PresenceDot member={member} />
          </div>
          {member.description && (
            <p className="text-[13px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {member.description}
            </p>
          )}
        </div>
      </Card>
    ),
    [
      member,
      handleMouseEnter,
      handleMouseLeave,
      showVideo,
      activeVideo,
      videoError,
      isMuted,
      handleVideoError,
      loading,
      toggleLike,
      hasLiked,
      toggleMute,
      memberVideos.length,
      memberPhotos.length,
      age,
      distanceText,
    ]
  );

  if (memberPhotos.length <= 1) {
    const defaultImage =
      memberPhotos.length === 1
        ? memberPhotos[0].url
        : member.image || "/images/user.png";
    return renderCardContent(defaultImage, true);
  }

  return (
    <div className="group">
      <MemberImageCarousel
        images={memberPhotos}
        onIndexChange={setCurrentIndex}
        prioritizeFirstImage
      >
        {(currentImage) => renderCardContent(currentImage.url, isPriority)}
      </MemberImageCarousel>
    </div>
  );
}
