"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Play, VolumeX, Volume2 } from "lucide-react";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";

interface MemberCardProps {
  member: Member & { distance?: number };
  likeIds: string[];
  memberPhotos?: Array<{ url: string; id: string }>;
  memberVideos?: Array<{ url: string; id: string }>;
  onLike?: (memberId: string, isLiked: boolean) => void;
}

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
  memberVideos = [],
  onLike,
}: MemberCardProps) {
  const [hasLiked, setHasLiked] = useState<boolean>(
    likeIds.includes(member.userId)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    if (memberVideos.length > 0 && !activeVideo) {
      setActiveVideo(memberVideos[0].url);
    }
  }, [memberVideos, activeVideo]);

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
            <span className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md z-50">
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
                preload="metadata"
                onError={handleVideoError}
              />
            </div>
          )}

          <Image
            alt={member.name}
            src={transformImageUrl(imageUrl) || "/images/user.png"}
            className={`w-full h-full object-cover transition-all duration-500 ease-in-out transform group-hover:scale-110 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "low"}
            priority={isPriority}
          />

          <div className="absolute top-2 right-2 z-50">
            <PresenceDot member={member} />
          </div>

          <div className="absolute top-2 left-2 z-50 flex gap-1 items-center">
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

          <CardFooter
            className="flex items-center justify-between overflow-hidden absolute bottom-0 z-50 w-full px-3 py-2 bg-black/50 backdrop-blur-[2px]"
            dir="rtl"
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white font-medium">
                  {member.city}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {calculateAge(member.dateOfBirth)}
                </span>
                {member.distance !== undefined && (
                  <span className="text-xs text-white/90 font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                    📍 {formatDistance(member.distance)}
                  </span>
                )}
              </div>
              <span className="font-semibold text-sm text-white">
                {member.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {memberVideos.length > 0 && !showVideo && (
                <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 animate-ping rounded-full bg-white/30"></div>
                    <div className="relative z-10 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {memberVideos.length > 0 && showVideo && (
                <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                  <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-white" fill="white" />
                  </div>
                </div>
              )}

              {memberPhotos.length > 1 && (
                <div className="flex items-center bg-white/20 backdrop-blur-[1px] rounded-md px-1.5 py-0.5 border border-white/10">
                  <span className="text-white text-[10px] font-medium tracking-tight">
                    {currentIndex + 1}/{memberPhotos.length}
                  </span>
                </div>
              )}
            </div>
          </CardFooter>
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
      currentIndex,
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
        {(currentImage, isPriority) =>
          renderCardContent(currentImage.url, isPriority)
        }
      </MemberImageCarousel>
    </div>
  );
}
