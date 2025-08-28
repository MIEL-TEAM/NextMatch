"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Member } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import FilterButtons from "@/components/FilterButtons";
import SpotlightMember from "./SpotlightMember";
import AnimatedBackground from "./AnimatedBackground";
import MembersGrid from "./MembersGrid";
import InlineEmptyState from "@/components/EmptyState";
import { ImageOff } from "lucide-react";

interface MemberWithMedia {
  member: Member;
  photos: Array<{ url: string; id: string }>;
  videos: Array<{ url: string; id: string }>;
}

interface Props {
  membersData: MemberWithMedia[];
  totalCount: number;
  likeIds: string[];
  isOnlineFilter: boolean;
  noResults: boolean;
  hasSeenIntro: boolean;
}

const MembersLayout: React.FC<Props> = ({
  membersData,
  totalCount,
  likeIds,
  isOnlineFilter,
  noResults,
  hasSeenIntro,
}) => {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    // Check localStorage first to prevent flash
    if (typeof window !== "undefined") {
      const hasSeenLocal =
        localStorage.getItem("hasSeenMembersIntro") === "true";
      return !hasSeenIntro && !hasSeenLocal;
    }
    return !hasSeenIntro;
  });
  const [showMotivation, setShowMotivation] = useState(false);
  const [likes, setLikes] = useState<string[]>(likeIds);
  const [isChangingSpotlight, setIsChangingSpotlight] = useState(false);

  const userHasNoLikes = likes.length === 0;
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
    // Update localStorage immediately to prevent re-showing
    localStorage.setItem("hasSeenMembersIntro", "true");
    setShowIntro(false);

    // Update database in background without waiting
    fetch("/api/user/intro", { method: "POST" }).catch((error) => {
      console.error("Failed to update intro status:", error);
    });
  };

  const handleLike = (memberId: string) => {
    if (!likes.includes(memberId)) {
      setLikes((prev) => [...prev, memberId]);

      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 3500);
    }
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

        <FilterButtons
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
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

      <AnimatePresence>
        {userHasNoLikes && !showMotivation && (
          <motion.div
            key="no-likes"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-0 inset-x-0 z-[9999]"
          >
            <div className="bg-orange-100 text-orange-800 text-center font-medium py-3 px-6 text-sm sm:text-base shadow-md w-full">
              🤔 עדיין לא סימנת לייקים. בחר פרופילים שמעניינים אותך כדי שנוכל
              להציע התאמות טובות יותר!
            </div>
          </motion.div>
        )}

        {showMotivation && (
          <motion.div
            key="motivation"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-0 inset-x-0 z-[9999]"
          >
            <div className="bg-orange-100 text-orange-800 text-center font-medium py-3 px-6 text-sm sm:text-base shadow-md w-full">
              🎉 מעולה! המשך כך כדי לשפר את ההתאמות שתקבל!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembersLayout;
