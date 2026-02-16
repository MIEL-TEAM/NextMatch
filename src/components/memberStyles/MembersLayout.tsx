"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DiscoverySortControl from "@/components/search/DiscoverySortControl";
import SpotlightMember from "./SpotlightMember";
import AnimatedBackground from "./AnimatedBackground";
import MembersGrid from "./MembersGrid";
import InlineEmptyState from "@/components/EmptyState";
import { ImageOff } from "lucide-react";
import { Props } from "@/types/members";

const MembersLayout: React.FC<Props> = ({
  membersData,
  totalCount,
  likeIds,
  isOnlineFilter,
  noResults,
  hasSeenIntro,
  onLikeUpdate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);

  useEffect(() => {
    if (!hasSeenIntro) {
      const hasSeenLocal =
        typeof window !== "undefined" &&
        localStorage.getItem("hasSeenMembersIntro") === "true";

      if (hasSeenLocal) {
        setShowIntro(false);
      }
    }
  }, [hasSeenIntro]);

  const [likes, setLikes] = useState<string[]>(likeIds);
  const [isChangingSpotlight, setIsChangingSpotlight] = useState(false);

  const membersWithImages = membersData.filter(({ member }) => !!member.image);
  const spotlightMember =
    membersWithImages[currentIndex % membersWithImages.length]?.member || null;

  useEffect(() => {
    if (membersWithImages.length <= 1) return;
    const timer = setInterval(() => {
      setIsChangingSpotlight(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % membersWithImages.length);
        setTimeout(() => setIsChangingSpotlight(false), 300);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, [membersWithImages.length]);

  const handleDismissIntro = async () => {
    localStorage.setItem("hasSeenMembersIntro", "true");
    setShowIntro(false);

    fetch("/api/user/intro", { method: "POST" }).catch((error) => {
      console.error("Failed to update intro status:", error);
    });
  };

  const handleLike = (memberId: string, isLiked: boolean) => {
    if (isLiked && !likes.includes(memberId)) {
      setLikes((prev) => [...prev, memberId]);
    } else if (!isLiked && likes.includes(memberId)) {
      setLikes((prev) => prev.filter((id) => id !== memberId));
    }

    onLikeUpdate?.(memberId, isLiked);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {showIntro && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-orange-700 mb-3">
              ברוך/ה הבא/ה!
            </h2>
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              דפדף בפרופילים, סמן לייק על מי שמעניין אותך או שלח הודעה — כך נלמד
              את ההעדפות שלך ונספק התאמות חכמות במיוחד עבורך.
            </p>
            <button
              onClick={handleDismissIntro}
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
            >
              הבנתי, בוא נתחיל!
            </button>
          </div>
        </div>
      )}

      <motion.div
        className="relative pt-8 sm:pt-12 pb-4 sm:pb-6 px-3 sm:px-4 md:px-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 bg-clip-text text-transparent"
          style={{ direction: "rtl" }}
        >
          גלה אנשים מיוחדים
        </motion.h1>
        <motion.p
          className="text-lg text-gray-700 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ direction: "rtl" }}
        >
          מצא את החיבור המשמעותי הבא שלך באמצעות האלגוריתם החכם שלנו
        </motion.p>

        {spotlightMember && (
          <SpotlightMember
            spotlight={spotlightMember}
            isChangingSpotlight={isChangingSpotlight}
            spotlightIndex={currentIndex}
            membersData={membersWithImages}
            calculateAge={(dob) => {
              const today = new Date();
              const birth = new Date(dob);
              let age = today.getFullYear() - birth.getFullYear();
              if (
                today.getMonth() < birth.getMonth() ||
                (today.getMonth() === birth.getMonth() &&
                  today.getDate() < birth.getDate())
              ) {
                age--;
              }
              return age;
            }}
          />
        )}

        <DiscoverySortControl />
      </motion.div>

      {(membersData.length === 0 || noResults) && (
        <div className="max-w-4xl mx-auto px-4">
          <InlineEmptyState
            message={
              isOnlineFilter ? "אף אחד לא מחובר כרגע" : "אין משתמשים זמינים"
            }
            subMessage={
              isOnlineFilter
                ? "נסה שוב מאוחר יותר או בחר סינון אחר"
                : "נסה שוב מאוחר יותר או שנה את הגדרות הסינון"
            }
            icon={<ImageOff size={48} />}
          />
        </div>
      )}

      <MembersGrid
        membersData={membersData}
        likeIds={likes}
        totalCount={totalCount}
        onLike={handleLike}
      />
    </div>
  );
};

export default MembersLayout;
