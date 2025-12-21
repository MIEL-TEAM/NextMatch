"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { transformImageUrl } from "@/lib/util";
import { Card, CardFooter } from "@nextui-org/react";
import NextImage from "next/image";
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
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import VerifiedRibbon from "@/components/VerifiedRibbon";

type SmartMemberCardProps = {
  member: Member & {
    matchReason?: string;
    matchScore?: number;
    premiumInsights?: string;
    user?: {
      oauthVerified?: boolean;
      lastActiveAt?: Date | null;
    };
  };
  memberPhotos?: Array<{ url: string; id: string }>;
  index?: number;
};

const getScoreBadgeStyle = (score: number): string => {
  if (score >= 90) {
    return "bg-gradient-to-r from-orange-500 to-red-500";
  } else if (score >= 75) {
    return "bg-gradient-to-r from-amber-500 to-orange-500";
  } else if (score >= 60) {
    return "bg-gradient-to-r from-yellow-500 to-amber-500";
  } else {
    return "bg-gradient-to-r from-gray-400 to-slate-500";
  }
};

const getScoreText = (score: number): string => {
  if (score >= 90) {
    return "✨ התאמה מעולה";
  } else if (score >= 75) {
    return "💫 התאמה טובה";
  } else if (score >= 60) {
    return "🔥 פוטנציאל טוב";
  } else {
    return "💭 אולי מעניין";
  }
};

export default function SmartMemberCard({
  member,
  memberPhotos = [],
}: SmartMemberCardProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Array<{ url: string; id: string }>>([]);
  const [showPremiumInsights, setShowPremiumInsights] = useState(false);
  const trackInteractions = useInteractionTracking(member.userId);
  const router = useRouter();
  const processedPhotosRef = useRef(false);
  const likeCheckedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = cardRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || likeCheckedRef.current) return;
    (async () => {
      try {
        const likedIds = await fetchCurrentUserLikeIds();
        if (likedIds.includes(member.userId)) setHasLiked(true);
        likeCheckedRef.current = true;
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    })();
  }, [isVisible, member.userId]);

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
      const result = await toggleLikeMember(member.userId, hasLiked);

      if (result.success) {
        await trackInteractions.like();
        setHasLiked(!hasLiked);

        toast.success(hasLiked ? "הוסר מהאהובים" : "נוסף לאהובים", {
          position: "bottom-right",
        });
      } else if (result.alreadyLiked) {
        toast.error(`כבר עשית לייק ל${member.name}`, {
          position: "bottom-right",
        });
      } else {
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
          position: "bottom-right",
        });
      }
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

  const getCardAnimation = () => {
    if (member.matchScore && member.matchScore >= 95) {
      return "hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 transition-all duration-500 ring-2 ring-pink-400/40 animate-pulse";
    } else if (member.matchScore && member.matchScore >= 90) {
      return "hover:scale-104 hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-400 ring-2 ring-yellow-400/30";
    } else if (member.matchScore && member.matchScore >= 80) {
      return "hover:scale-102 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 ring-1 ring-orange-400/20";
    }
    return "hover:shadow-lg hover:scale-101 transition-all duration-300";
  };

  const renderCardContent = (imageUrl: string, isPriority: boolean = false) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
      ref={cardRef}
    >
      <Card
        isPressable
        className={`w-full h-full smart-member-card ${getCardAnimation()}`}
        onPress={handleProfileClick}
      >
        <div className="relative w-full h-full smart-member-card overflow-hidden rounded-t-lg">
          <div className="absolute inset-0">
            <NextImage
              alt={member.name}
              src={transformImageUrl(imageUrl) || "/images/user.png"}
              className="object-cover transition-all duration-200 ease-in-out transform group-hover:scale-105"
              fill
              sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : "low"}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABAgEAf6qL9wAAAABJRU5ErkJggg=="
              priority={isPriority}
            />
          </div>

          {/* OAuth Verification Ribbon */}
          {member.user?.oauthVerified && <VerifiedRibbon />}

          {/* Like button */}
          <div className="absolute top-3 left-3 z-20">
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton
                loading={loading}
                toggleLike={toggleLike}
                hasLiked={hasLiked}
              />
            </div>
          </div>

          {/* Presence Dot - Top Right */}
          <div className="absolute top-3 right-3 z-20">
            <PresenceDot member={member} />
          </div>

          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5">
            <div className="flex items-center gap-1 bg-black/55 text-white rounded-full px-2 py-0.5 backdrop-blur-sm border border-white/10">
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[11px] leading-none font-medium">
                {Math.max(photos.length, member.image ? 1 : 0)}
              </span>
            </div>
          </div>

          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <motion.span
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg"
            >
              🧠 AI מתקדם
            </motion.span>
          </div>

          <CardFooter className="flex flex-col items-start justify-between gap-3 bg-gradient-to-t from-black/80 via-black/60 to-transparent absolute bottom-0 z-20 w-full p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col text-white">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">{member.name}</span>
                </div>
                <span className="text-sm text-white/90">{member.city}</span>
              </div>

              {member.matchScore && (
                <span
                  className={`text-white px-3 py-1 rounded-full text-xs font-bold shadow-md ${getScoreBadgeStyle(member.matchScore)}`}
                >
                  {getScoreText(member.matchScore)}{" "}
                  {Math.round(member.matchScore)}%
                </span>
              )}
            </div>

            {member.matchReason && member.matchReason.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-orange-900 text-sm rounded-xl px-4 py-3 shadow-lg w-full backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5 text-base">
                    ✨
                  </span>
                  <p className="leading-relaxed font-medium">
                    {member.matchReason}
                  </p>
                </div>
              </motion.div>
            )}

            {member.premiumInsights && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="w-full"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPremiumInsights(!showPremiumInsights);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all w-full"
                >
                  {showPremiumInsights ? "הסתר תובנות" : "🔮 תובנות פרמיום"}
                </button>

                {showPremiumInsights && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-900 text-xs rounded-lg px-3 py-2 mt-2 shadow-inner"
                  >
                    {member.premiumInsights}
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );

  if (photos.length <= 1) {
    const defaultImage =
      photos.length === 1 ? photos[0].url : "/images/user.png";
    return renderCardContent(defaultImage, true);
  }

  return (
    <div className="flex flex-col justify-between h-full smart-member-card-container">
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl smart-member-card">
        <MemberImageCarousel images={photos} prioritizeFirstImage={true}>
          {(currentImage, isPriority) =>
            renderCardContent(currentImage.url, isPriority)
          }
        </MemberImageCarousel>
      </div>
    </div>
  );
}
