"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import MemberCard from "@/app/members/MemberCard";
import PaginationComponent from "@/components/PaginationComponent";
import Image from "next/image";
import { Member } from "@prisma/client";
import FilterButtons from "./FilterButtons";

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
}

const MembersStylePage: React.FC<MembersStylePageProps> = ({
  membersData,
  totalCount,
  likeIds,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilter = searchParams.get("filter") || "all";
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [spotlight, setSpotlight] = useState<Member | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [backgroundCircles, setBackgroundCircles] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isChangingSpotlight, setIsChangingSpotlight] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const circles = Array.from({ length: 6 }).map((_, index) => ({
      id: `circle-${index}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 300 + 100}px`,
      height: `${Math.random() * 300 + 100}px`,
      xMovement: Math.random() * 50 - 25,
      yMovement: Math.random() * 50 - 25,
      duration: Math.random() * 10 + 20,
    }));

    setBackgroundCircles(circles);

    if (membersData && membersData.length > 0) {
      setSpotlight(membersData[0].member);
    }
  }, [membersData]);

  useEffect(() => {
    if (!membersData || membersData.length === 0) return;

    const intervalId = setInterval(() => {
      setIsChangingSpotlight(true);
      setTimeout(() => {
        const nextIndex = (spotlightIndex + 1) % membersData.length;
        setSpotlightIndex(nextIndex);
        setSpotlight(membersData[nextIndex].member);
        setIsChangingSpotlight(false);
      }, 300);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [membersData, spotlightIndex]);

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

        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
            {membersData?.map(({ member }) => (
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
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 -z-10">
        {backgroundCircles.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute rounded-full bg-orange-400/5"
            style={{
              top: circle.top,
              left: circle.left,
              width: circle.width,
              height: circle.height,
            }}
            animate={{
              x: [0, circle.xMovement],
              y: [0, circle.yMovement],
            }}
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

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

        <div className="max-w-4xl mx-auto mb-10 sm:mb-16 relative">
          <div className="absolute inset-0 shadow-[0_8px_30px_rgb(255,140,0,0.12)] rounded-xl"></div>

          <AnimatePresence mode="wait">
            {spotlight && !isChangingSpotlight && (
              <motion.div
                key={spotlight.id}
                className="relative bg-white rounded-xl shadow-sm overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row">
                  <div
                    className="relative w-full md:w-1/3 overflow-hidden"
                    style={{ minHeight: "240px" }}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={spotlight.image || "/images/placeholder.jpg"}
                        alt={spotlight.name || "Profile image"}
                        className="object-cover"
                        width={600}
                        height={800}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        priority
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-black/70 md:via-transparent md:to-transparent"></div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 md:p-8 w-full md:w-2/3 text-left flex flex-col justify-center">
                    <div className="flex items-center m-0 justify-between">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mb-1 sm:mb-2 flex items-center">
                        הצטרפו לאחרונה
                        <span className="ml-2">✨</span>
                      </h3>
                      <div className="flex gap-x-1">
                        {membersData.slice(0, 5).map((_, idx) => (
                          <span
                            key={idx}
                            className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              idx === spotlightIndex % 5
                                ? "bg-orange-500"
                                : "bg-orange-200"
                            }`}
                          ></span>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-lg sm:text-xl font-semibold mb-1">
                      {spotlight.name}, {calculateAge(spotlight.dateOfBirth)}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">
                      {spotlight.city}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2 md:line-clamp-3">
                      {spotlight.description ||
                        "אדם מעניין עם אהבה לחיים, הרפתקאות ויצירת קשרים אמיתיים."}
                    </p>
                    <div className="flex gap-2 sm:gap-3 mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md text-xs sm:text-sm md:text-base"
                        onClick={() =>
                          router.push(`/members/${spotlight.userId}`)
                        }
                      >
                        צפה בפרופיל המלא
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 border-2 border-orange-400 text-orange-500 rounded-full text-xs sm:text-sm md:text-base"
                        onClick={() =>
                          router.push(`/members/${spotlight.userId}/chat`)
                        }
                      >
                        שלח הודעה
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <FilterButtons
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
          {membersData?.map(({ member }) => (
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
                <MemberCard member={member} likeIds={likeIds} />
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
    </div>
  );
};

export default MembersStylePage;
