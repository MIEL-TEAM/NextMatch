"use client";

import { useEffect, useState, Key, useTransition, useMemo } from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { Member, Photo } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MemberCard from "../members/MemberCard";
import { getMemberPhotos } from "../actions/memberActions";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import HeartLoading from "@/components/HeartLoading";
import { useLikedMembersQuery } from "@/hooks/useLikedMembersQuery";

type ListsProps = {
  members: Member[];
  likeIds: string[];
};

type ProcessedPhoto = {
  url: string;
  id: string;
};

const tabs = [
  { id: "source", label: "החברים שאהבתי", icon: "❤️" },
  { id: "target", label: "החברים שאהבו אותי", icon: "😍" },
  { id: "mutual", label: "לייקים הדדיים", icon: "💞" },
];

export default function ListsTab({
  members: initialMembers,
  likeIds: initialLikeIds,
}: ListsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [membersWithPhotos, setMembersWithPhotos] = useState<
    { member: Member; photos: Photo[] }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  const selectedTab = searchParams.get("type") || tabs[0].id;
  const { data, isLoading, isError } = useLikedMembersQuery(selectedTab);

  // בחירת המקור הנכון לנתונים - מ-query או מהפרופס הראשוניים
  const members = data?.members || initialMembers;
  const likeIds = data?.likeIds || initialLikeIds;

  const processedMembersData = useMemo(() => {
    return membersWithPhotos.map(({ member, photos }) => {
      const processedPhotos: ProcessedPhoto[] = [];

      if (member.image) {
        processedPhotos.push({ url: member.image, id: "profile" });
      }

      if (photos && photos.length > 0) {
        photos.forEach((photo) => {
          if (photo && photo.url) {
            if (!processedPhotos.some((p) => p.url === photo.url)) {
              processedPhotos.push({ url: photo.url, id: photo.id });
            }
          }
        });
      }

      return { member, processedPhotos };
    });
  }, [membersWithPhotos]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setStatus("loading");
        const data = await Promise.all(
          members.map(async (member) => ({
            member,
            photos: (await getMemberPhotos(member.userId)) || [],
          }))
        );
        setMembersWithPhotos(data);
        setStatus("success");
      } catch (err) {
        console.error("שגיאה בטעינת המשתמשים", err);
        toast.error("⚠️ לא ניתן לטעון את רשימת המשתמשים. נסה שוב מאוחר יותר.");
        setStatus("error");
      }
    };

    fetchPhotos();
  }, [members]);

  const handleTabChange = (key: Key) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", key.toString());
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  // משתמשים בסטטוס הנוכחי או בסטטוס מ-React Query
  const currentStatus =
    isLoading && !data ? "loading" : isError ? "error" : status;

  const getEmptyMessage = () => {
    switch (selectedTab) {
      case "source":
        return "עדיין לא אהבת אף אחד. התחל לגלות אנשים מעניינים!";
      case "target":
        return "עדיין אף אחד לא אהב את הפרופיל שלך. שפר את הפרופיל שלך כדי למשוך יותר תשומת לב!";
      case "mutual":
        return "אין עדיין התאמות הדדיות. המשך לחפש ולהתאים!";
      default:
        return "אין עדיין לייקים.";
    }
  };

  return (
    <div className="flex w-full flex-col mt-4 md:mt-6 gap-3 md:gap-5 px-2 md:px-4">
      <div className="relative">
        <motion.div
          className="w-full bg-opacity-80 backdrop-blur-sm rounded-xl p-1 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Tabs
            aria-label="Like Tabs"
            color="secondary"
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
            className="w-full"
            size="lg"
            variant="bordered"
          >
            {tabs.map((item) => (
              <Tab
                key={item.id}
                title={
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm md:text-base font-medium">
                      {item.label}
                    </span>
                  </div>
                }
              />
            ))}
          </Tabs>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-2 right-2"
            >
              <div className="w-6 h-6">
                <motion.svg viewBox="0 0 32 32" className="w-full h-full">
                  <motion.path
                    d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454
                    C30,20.335,16,28.261,16,28.261z"
                    stroke="#FF8A00"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="rgba(255, 138, 0, 0.3)"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      transition: {
                        pathLength: {
                          duration: 1.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                        },
                        opacity: {
                          duration: 0.5,
                          repeat: Infinity,
                          repeatType: "reverse",
                        },
                      },
                    }}
                  />
                </motion.svg>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {currentStatus === "loading" ? (
        <div className="flex flex-col items-center justify-center vertical-center py-10">
          <div className="w-32 h-32 mb-2">
            <HeartLoading message="טוען..." />
          </div>
        </div>
      ) : currentStatus === "error" ? (
        <motion.div
          className="text-center bg-red-50 border border-red-200 rounded-lg p-6 my-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-1">
            שגיאה בטעינת הנתונים
          </h3>
          <p className="text-red-500">נסה לרענן את העמוד או לחזור מאוחר יותר</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {processedMembersData.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {processedMembersData.map(({ member, processedPhotos }) => (
                  <motion.div
                    key={member.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <MemberCard
                      member={member}
                      likeIds={likeIds}
                      memberPhotos={processedPhotos}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16 px-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white bg-opacity-70 rounded-xl shadow-sm p-8 max-w-lg mx-auto">
                  <div className="text-4xl mb-4">
                    {selectedTab === "source"
                      ? "❤️"
                      : selectedTab === "target"
                        ? "😍"
                        : "💞"}
                  </div>
                  <h3 className="text-xl font-semibold text-orange-600 mb-3">
                    אין עדיין לייקים
                  </h3>
                  <p className="text-gray-600">{getEmptyMessage()}</p>
                  {selectedTab === "source" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-medium shadow-sm"
                      onClick={() => router.push("/members")}
                    >
                      גלה אנשים חדשים
                    </motion.button>
                  )}
                  {selectedTab === "target" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-medium shadow-sm"
                      onClick={() => router.push("/profile")}
                    >
                      שפר את הפרופיל שלי
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
