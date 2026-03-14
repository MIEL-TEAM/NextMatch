"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Member } from "@prisma/client";
import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { useMemo, type ReactNode } from "react";
import Icon from "@/lib/table/Icon";
import { gt } from "@/lib/gender";

interface SpotlightMemberProps {
  spotlight: Member | null;
  isChangingSpotlight: boolean;
  spotlightIndex: number;
  membersData: any[];
  calculateAge: (dateOfBirth: Date) => number;
}

const SpotlightMember: React.FC<SpotlightMemberProps> = ({
  spotlight,
  isChangingSpotlight,
  spotlightIndex,
  membersData,
  calculateAge,
}) => {
  const router = useRouter();

  const titleLabel = useMemo((): ReactNode => {
    if (!spotlight) return null;

    const gender = spotlight.gender as "male" | "female" | null;
    const now = new Date();
    const user = (spotlight as any).user as {
      lastActiveAt?: Date | string | null;
      isPremium?: boolean;
      oauthVerified?: boolean;
    } | undefined;
    const lastActiveAt = user?.lastActiveAt ? new Date(user.lastActiveAt) : null;
    const boostedUntil = (spotlight as any).boostedUntil
      ? new Date((spotlight as any).boostedUntil)
      : null;

    const spotlightEntry = membersData.find((m: any) => m.member?.id === spotlight.id) as any;
    const videos = spotlightEntry?.videos as Array<unknown> | undefined;

    if (lastActiveAt && differenceInMinutes(now, lastActiveAt) < 5) {
      return (
        <span className="flex items-center gap-1.5 text-orange-500">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-orange-500" />
          </span>
          {gt("activeNow", gender)}
        </span>
      );
    }

    if (lastActiveAt && differenceInHours(now, lastActiveAt) < 24) {
      return (
        <span className="flex items-center gap-1 text-amber-500">
          <Icon name="bolt" className="size-4 bg-current" />
          {gt("activeToday", gender)}
        </span>
      );
    }

    if (boostedUntil && boostedUntil > now) {
      return (
        <span className="flex items-center gap-1 text-orange-600">
          <Icon name="fire-flame-curved" className="size-4 bg-current" />
          פרופיל מומלץ
        </span>
      );
    }

    if (user?.isPremium) {
      return (
        <span className="flex items-center gap-1 text-amber-500">
          <Icon name="crown" className="size-4 bg-current" />
          {gt("premium", gender)}
        </span>
      );
    }

    if (user?.oauthVerified) {
      return (
        <span className="flex items-center gap-1 text-amber-600">
          <Icon name="badge-check" className="size-4 bg-current" />
          {gt("verified", gender)}
        </span>
      );
    }

    if (lastActiveAt && differenceInDays(now, lastActiveAt) < 7) {
      return (
        <span className="flex items-center gap-1 text-amber-400">
          <Icon name="clock" className="size-4 bg-current" />
          {gt("recentlyActive", gender)}
        </span>
      );
    }

    if (videos && videos.length > 0) {
      return (
        <span className="flex items-center gap-1 text-orange-500">
          <Icon name="video" className="size-4 bg-current" />
          וידאו בפרופיל
        </span>
      );
    }

    if (differenceInDays(now, new Date(spotlight.created)) < 7) {
      return (
        <span className="flex items-center gap-1 text-amber-400">
          <Icon name="star" className="size-4 bg-current" />
          {gt("newMember", gender)}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-orange-600">
        <Icon name="sparkles" className="size-4 bg-current" />
        שווה להכיר
      </span>
    );
  }, [spotlight, membersData]);

  if (!spotlight || !membersData.length) return null;

  const imageUrl = spotlight.image;

  return (
    <div className="max-w-4xl mx-auto mb-10 sm:mb-16 relative">
      <div className="absolute inset-0 shadow-[0_8px_30px_rgb(255,140,0,0.12)] rounded-xl"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={spotlight.id}
          className="relative bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              duration: isChangingSpotlight ? 0.3 : 0.6,
              ease: "easeInOut",
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.3 },
          }}
        >
          <div className="flex flex-col md:flex-row">
            <div
              className="relative w-full md:w-1/3 overflow-hidden"
              style={{ minHeight: "240px" }}
            >
              <div className="absolute inset-0">

                {imageUrl ? (
                  <Image
                    key={imageUrl}
                    src={imageUrl}
                    alt={spotlight.name || "Profile image"}
                    className="object-cover"
                    width={600}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Image
                    src="/images/placeholder.jpg"
                    alt="Profile image"
                    className="object-cover"
                    width={600}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    priority
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-black/70 md:via-transparent md:to-transparent"></div>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-8 w-full md:w-2/3 text-right flex flex-col justify-center">
              <div className="flex items-center m-0 justify-between">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mb-1 sm:mb-2">
                  {titleLabel}
                </h3>
                <div className="flex gap-x-1 overflow-hidden">
                  {membersData.slice(0, 5).map((_, idx) => (
                    <span
                      key={idx}
                      className={`inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${idx === spotlightIndex % 5
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
                  "אדם מעניין עם אהבה לחיים, הרפתקאות ויצירת קשרים אמיתיים."
                }
              </p>

              <div className="flex gap-2 sm:gap-3 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-md text-xs sm:text-sm md:text-base"
                  onClick={() => router.push(`/members/${spotlight.userId}`)}
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
      </AnimatePresence>
    </div>
  );
};

export default SpotlightMember;
