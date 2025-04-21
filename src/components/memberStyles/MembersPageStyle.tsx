"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import MemberCard from "@/app/members/MemberCard";
import PaginationComponent from "@/components/PaginationComponent";
import { Member } from "@prisma/client";
import FilterButtons from "@/components/FilterButtons";
import InlineEmptyState from "@/components/EmptyState";
import { ImageOff } from "lucide-react";
import SpotlightMember from "./SpotlightMember";
import AnimatedBackground from "./AnimatedBackground";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

interface MemberWithPhotos {
  member: Member;
  photos: Array<{ url: string; id: string }>;
}

interface MembersStylePageProps {
  membersData: MemberWithPhotos[];
  totalCount: number;
  likeIds: string[];
  isOnlineFilter?: boolean;
  noResults?: boolean;
}

const MembersStylePage: React.FC<MembersStylePageProps> = ({
  membersData,
  totalCount,
  likeIds,
  isOnlineFilter = false,
  noResults = false,
}) => {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isChangingSpotlight, setIsChangingSpotlight] = useState(false);
  const [shouldShowSpotlight, setShouldShowSpotlight] = useState(true);

  const membersWithImages = membersData.filter(({ member }) => {
    if (!member || !member.image) return false;

    if (member.image.includes("googleusercontent")) return true;

    return true;
  });

  const hasSpotlightMembers = membersWithImages.length > 0;

  useEffect(() => {
    if (!hasSpotlightMembers) {
      setShouldShowSpotlight(false);
    } else {
      setShouldShowSpotlight(true);
    }
  }, [hasSpotlightMembers]);

  const currentSpotlightMember = hasSpotlightMembers
    ? membersWithImages[currentIndex % membersWithImages.length].member
    : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!hasSpotlightMembers || membersWithImages.length <= 1) return;

    const timerId = setInterval(() => {
      setIsChangingSpotlight(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % membersWithImages.length;
          return newIndex;
        });

        setTimeout(() => {
          setIsChangingSpotlight(false);
        }, 300);
      }, 300);
    }, 4000);

    return () => {
      clearInterval(timerId);
    };
  }, [hasSpotlightMembers, membersWithImages.length]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="pt-12 pb-6 px-4 md:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 text-orange-600"
            style={{ direction: "rtl" }}
          >
            גלה אנשים מיוחדים
          </h1>
          <p
            className="text-lg text-gray-700 max-w-2xl mx-auto mb-10"
            style={{ direction: "rtl" }}
          >
            מצא את החיבור המשמעותי הבא שלך באמצעות האלגוריתם החכם שלנו
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
            {membersData.map(({ member }) => (
              <div key={member.id} className="relative">
                <MemberCard member={member} likeIds={likeIds} />
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <PaginationComponent totalCount={totalCount} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="relative pt-8 sm:pt-12 pb-4 sm:pb-6 px-3 sm:px-4 md:px-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 inline-block bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 bg-clip-text text-transparent"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ direction: "rtl" }}
        >
          גלה אנשים מיוחדים
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-6 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ direction: "rtl" }}
        >
          מצא את החיבור המשמעותי הבא שלך באמצעות האלגוריתם החכם שלנו
        </motion.p>

        {shouldShowSpotlight && hasSpotlightMembers && (
          <SpotlightMember
            spotlight={currentSpotlightMember}
            isChangingSpotlight={isChangingSpotlight}
            spotlightIndex={currentIndex}
            membersData={membersWithImages}
            calculateAge={calculateAge}
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

      {membersData.length > 0 && !noResults && (
        <motion.div
          className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
            {membersData.map(({ member, photos }) => (
              <motion.div
                key={member.id}
                variants={item}
                transition={{ duration: 0.4 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="relative group"
              >
                <div className="absolute inset-1 bg-gradient-to-r from-amber-300/20 to-orange-400/20 rounded-lg blur-[0.5px] opacity-0 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative">
                  <MemberCard
                    member={member}
                    likeIds={likeIds}
                    memberPhotos={photos}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 sm:mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <PaginationComponent totalCount={totalCount} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MembersStylePage;
