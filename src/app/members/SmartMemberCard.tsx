"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { transformImageUrl } from "@/lib/util";
import { Card } from "@nextui-org/react";
import NextImage from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  toggleLikeMember,
  fetchCurrentUserLikeIds,
} from "../actions/likeActions";

import { useInteractionTracking } from "@/hooks/useInteractionTracking";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import VerifiedRibbon from "@/components/VerifiedRibbon";
import Carousel from "@/components/MemberImageCarousel";
import { SmartMemberCardProps } from "@/types/smart-matches";

export default function SmartMemberCard({
  member,
  memberPhotos = [],
}: SmartMemberCardProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const trackInteractions = useInteractionTracking(member.userId);
  const router = useRouter();
  const likeCheckedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Measureable data computation
  const measurableExplanation = useMemo(() => {
    const rawReason = member.matchReason;
    const tags = typeof rawReason === 'string' ? [] : (rawReason?.tags || []);

    // Filter tags
    const interestTags = tags.filter(tag =>
      !tag.includes('גיל') &&
      !tag.includes('Age') &&
      !tag.includes(String(new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear())) &&
      tag !== member.city &&
      !tag.includes('התאמה')
    );

    // 1. Behavioral similarity (score threshold > 0.75)
    // Assuming score passed is a percentage, so > 75
    if (member.matchScore && member.matchScore > 75) {
      return `דמיון התנהגותי גבוה (${Math.round(member.matchScore)}%) נמצא בניתוח נתונים`;
    }

    // 2. Interest overlap (min 2 shared keywords)
    if (interestTags.length >= 2) {
      return `זוהו ${interestTags.length} מילות מפתח משותפות: ${interestTags.join(', ')}`;
    }

    // 3. Age trend alignment (minimum 60% of recent likes)
    // Skipping as data not available in props strictly

    // 4. Strong location match
    if (tags.some(t => t === member.city)) {
      return "התאמה גיאוגרפית בטווח המועדף";
    }

    // If none pass thresholds → do not render insight block.
    return null;
  }, [member.matchReason, member.matchScore, member.city, member.dateOfBirth]);

  const displayPhotos = useMemo(() => {
    if (memberPhotos && memberPhotos.length > 0) {
      return memberPhotos;
    }
    if (member.image) {
      return [{ url: member.image, id: "profile" }];
    }
    return [];
  }, [memberPhotos, member.image]);

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
        toast.error(`כבר עשית לייק (ID: ${member.userId})`, {
          position: "bottom-right",
        });
      } else {
        toast.error("שגיאת מערכת: הפעולה נכשלה", {
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Like toggle error:", error);
      toast.error("שגיאת מערכת: הפעולה נכשלה", {
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
      ref={cardRef}
    >
      <Card
        isPressable
        className="w-full shadow-sm hover:shadow-md transition-shadow group rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
        onPress={handleProfileClick}
      >
        {/* Image Container - 4:5 Aspect Ratio */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <NextImage
            alt={member.name}
            src={transformImageUrl(imageUrl) || "/images/user.png"}
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            fill
            sizes="(min-width:1024px) 20vw, (min-width:768px) 25vw, 50vw"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "low"}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABAgEAf6qL9wAAAABJRU5ErkJggg=="
          />

          {/* Overlays - Minimal */}
          {member.user?.oauthVerified && (
            <div className="absolute top-2 left-10 z-20">
              <VerifiedRibbon />
            </div>
          )}

          <div className="absolute top-2 left-2 z-20">
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton
                loading={loading}
                toggleLike={toggleLike}
                hasLiked={hasLiked}
              />
            </div>
          </div>

          <div className="absolute top-2 right-2 z-20">
            <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white/90 border border-white/5">
              <span className="text-[10px] font-mono font-medium tracking-wide">
                {displayPhotos.length} תמונות
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Minimal Linear Style */}
        <div className="p-3 flex flex-col gap-3 font-sans text-right" dir="rtl">

          {/* Match Score */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-zinc-500">מדד התאמה</span>
              <span className="text-xs font-mono font-medium text-gray-900 dark:text-zinc-300">{Math.round(member.matchScore || 0)}%</span>
            </div>
            <div className="h-0.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-zinc-400 rounded-full"
                style={{ width: `${member.matchScore || 0}%` }}
              />
            </div>
          </div>

          {/* Measurable Explanation */}
          {measurableExplanation && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-zinc-500">תובנה</span>
              <p className="text-[11px] leading-relaxed text-gray-700 dark:text-zinc-400 font-normal">
                {measurableExplanation}
              </p>
            </div>
          )}

          {/* Identity */}
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-end">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-200 tracking-tight">
                {member.name}, {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()}
              </h3>
              <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {member.city}
              </span>
            </div>
            <div className="mb-1">
              <PresenceDot member={member} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (displayPhotos.length <= 1) {
    const defaultImage =
      displayPhotos.length === 1 ? displayPhotos[0].url : "/images/user.png";
    return renderCardContent(defaultImage, true);
  }

  return (
    <div className="group w-full">
      <Carousel<{ url: string; id: string }>
        items={displayPhotos}
        showArrows={true}
      >
        {(currentImage, index) =>
          renderCardContent(currentImage.url, index === 0)
        }
      </Carousel>
    </div>
  );
}
