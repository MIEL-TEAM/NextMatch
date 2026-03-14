"use client";

import React, { useState, useCallback, useRef } from "react";
import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { formatDistance } from "@/lib/locationUtils";
import { Card, CardFooter } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { toggleLikeMember } from "@/app/actions/likeActions";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import Icon from "@/lib/table/Icon";
import { MemberCardProps } from "@/types/members";
import FloatingReaction from "@/components/FloatingReaction";
import Carousel from "@/components/MemberImageCarousel";
import { isActivePremium } from "@/lib/premiumUtils";
import IconWithTooltip from "@/components/IconWithTooltip";
import { gt } from "@/lib/gender";

import { useVisibilityTracking } from "@/hooks/useVisibilityTracking";

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
  memberVideos = [],
  onLike,
  isPriority = false,
  activeVibe,
}: MemberCardProps) {
  const visibilityRef = useVisibilityTracking(member.userId);

  const hasLiked = likeIds.includes(member.userId);
  const [loading, setLoading] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const activeVideo = memberVideos.length > 0 ? memberVideos[0].url : null;
  const currentIndexRef = useRef<number>(0);
  const handleIndexChange = (index: number) => {
    currentIndexRef.current = index;
  };
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [showReaction, setShowReaction] = useState(false);
  const reactionCounter = useRef(0);

  const age = calculateAge(member.dateOfBirth);


  const toggleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!hasLiked && likeIds.includes(member.userId)) {
        toast.error(`כבר עשית לייק ל${member.name}`);
        return;
      }

      setLoading(true);

      try {
        const result = await toggleLikeMember(member.userId, hasLiked);

        if (result.success) {
          const newLikedState = !hasLiked;

          if (newLikedState) {
            reactionCounter.current += 1;
            setShowReaction(true);
          }

          if (onLike) {
            onLike(member.userId, newLikedState);
          }
        } else if (result.error === "LIKE_LIMIT_REACHED") {
          toast.error("הגעת למגבלת 3 לייקים ביום בפרופיל חינמי.", {
            description: "שדרג לפרימיום כדי לשלוח לייקים ללא הגבלה.",
            action: {
              label: "שדרג עכשיו",
              onClick: () => { window.location.href = "/premium"; },
            },
            duration: 6000,
          });
        } else if (result.alreadyLiked) {
          toast.error(`כבר עשית לייק ל${member.name}`);
        } else {
          toast.error("אירעה שגיאה, נסו שוב מאוחר יותר");
        }
      } catch (error) {
        console.error("Like toggle error:", error);
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר");
      } finally {
        setLoading(false);
      }
    },
    [member.userId, member.name, hasLiked, onLike, likeIds]
  );

  const handleMouseEnter = () => {
    if (memberVideos.length > 0 && activeVideo) {
      setVideoError(false);
      setShowVideo(true);
    }
  };

  const handleMouseLeave = () => {
    setShowVideo(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setShowVideo(false);
  };

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
          {showVideo && activeVideo && !videoError ? (
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
          ) : (
            <Image
              alt={member.name}
              src={transformImageUrl(imageUrl) || "/images/user.png"}
              className={`w-full h-full object-cover transition-all duration-200 ease-in-out transform group-hover:scale-105`}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : "low"}
              priority={isPriority}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABAgEAf6qL9wAAAABJRU5ErkJggg=="
            />
          )}

          <div className="absolute top-2 left-2 z-50">
            <LikeButton
              loading={loading}
              toggleLike={toggleLike}
              hasLiked={hasLiked}
              aria-label={hasLiked ? "בטל לייק" : "הוסף לייק"}
            />
          </div>

          {/* Mute/Unmute — top right corner */}
          {memberVideos.length > 0 && showVideo && (
            <div className="absolute top-2 right-2 z-50">
              <button
                onClick={toggleMute}
                className="bg-black/70 hover:bg-black/90 rounded-full p-[6px] transition-all duration-200 flex items-center justify-center shadow-lg ring-2 ring-blue-400/60 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/80"
                aria-label={isMuted ? "בטל השתקה" : "השתק וידאו"}
                type="button"
              >
                {isMuted ? (
                  <Icon name="volume-xmark" className="size-4 bg-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
                ) : (
                  <Icon name="volume-high" className="size-4 bg-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
                )}
              </button>
            </div>
          )}

          {/* Bottom-left media counters + location + verification */}
          <div className="absolute bottom-2 left-2 z-50 flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
              <Icon name="camera" className="size-3.5 bg-white" />
              <span className="text-[11px] leading-none font-medium">
                {Math.max(memberPhotos.length, member.image ? 1 : 0)}
              </span>
            </div>

            {memberVideos.length > 0 && (
              <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                <Icon name="video" className="size-3.5 bg-white" />
                <span className="text-[11px] leading-none font-medium">
                  {memberVideos.length}
                </span>
              </div>
            )}
            {typeof member.distance === "number" &&
              Number.isFinite(member.distance) && (
                <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
                  <Icon name="map-location-dot" className="size-3.5 bg-white" />
                  <span className="text-[11px] leading-none font-medium">
                    {formatDistance(member.distance)}
                  </span>
                </div>
              )}
            {member.user?.oauthVerified && (
              <IconWithTooltip
                icon={
                  <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full p-1 shadow-lg">
                    <Icon name="badge-check" className="size-4 bg-white" />
                  </div>
                }
                title="חשבון מאומת"
                description="זהות המשתמש אומתה ואושרה על ידי Miel"
                placement="above"
                align="left"
              />
            )}
            {isActivePremium(member.user) && (
              <span className="bg-white p-[3px] rounded-full shadow-sm flex-shrink-0 flex items-center justify-center">
                <IconWithTooltip
                  icon={<Icon name="fire" className="size-[15px] bg-[#FFB547]" />}
                  title={`${gt("premium", member.gender)} Miel+`}
                  description="חשבון פרימיום פעיל"
                  placement="above"
                  align="left"
                />
              </span>
            )}
          </div>

          <CardFooter className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 px-2 pb-2" />
        </div>

        {/* Title and description */}
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
          {activeVibe && (
            <div
              dir="rtl"
              className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] text-orange-600 font-medium leading-none"
            >
              {activeVibe}
            </div>
          )}

        </div>
      </Card>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      member,
      showVideo,
      activeVideo,
      videoError,
      isMuted,
      loading,
      toggleLike,
      hasLiked,
      toggleMute,
      memberVideos.length,
      memberPhotos.length,
      age,
    ]
  );

  const floatingReaction = (
    <AnimatePresence>
      {showReaction && (
        <FloatingReaction
          key={reactionCounter.current}
          name={member.name}
          onDismiss={() => setShowReaction(false)}
        />
      )}
    </AnimatePresence>
  );

  if (memberPhotos.length <= 1) {
    const defaultImage =
      memberPhotos.length === 1
        ? memberPhotos[0].url
        : member.image || "/images/user.png";
    return (
      <div className="relative w-full h-full" ref={visibilityRef}>
        {renderCardContent(defaultImage, true)}
        {floatingReaction}
      </div>
    );
  }

  return (
    <div className="relative group" ref={visibilityRef}>
      <Carousel<{ url: string; id: string }>
        items={memberPhotos}
        onIndexChange={handleIndexChange}
        showArrows={true}
      >
        {(currentImage) =>
          renderCardContent(currentImage.url, isPriority)
        }
      </Carousel>
      {floatingReaction}
    </div>
  );
}
