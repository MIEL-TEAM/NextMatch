"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Member } from "@prisma/client";

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

  if (!spotlight || !membersData.length) return null;

  let imageUrl = spotlight.image || "/images/placeholder.jpg";

  const isGoogleImage = imageUrl.includes("googleusercontent.com");
  if (isGoogleImage && imageUrl.includes("=s")) {
    imageUrl = imageUrl.replace(/=s\d+-c/, "=s400-c");
  }

  const formattedImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : imageUrl.startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;

  return (
    <div className="max-w-4xl mx-auto mb-10 sm:mb-16 relative">
      <div className="absolute inset-0 shadow-[0_8px_30px_rgb(255,140,0,0.12)] rounded-xl"></div>

      <AnimatePresence mode="wait">
        {spotlight && (
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
                  <Image
                    src={formattedImageUrl}
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
                    priority
                    unoptimized={isGoogleImage}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-black/70 md:via-transparent md:to-transparent"></div>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-8 w-full md:w-2/3 text-right flex flex-col justify-center">
                <div className="flex items-center m-0 justify-between">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 mb-1 sm:mb-2 flex items-center">
                    הצטרפו לאחרונה
                    <span className="mr-1">✨</span>
                  </h3>
                  <div className="flex gap-x-1 overflow-hidden">
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpotlightMember;
