"use client";

import { useEffect, useState, useMemo } from "react";
import { Member } from "@prisma/client";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import SmartMemberCard from "../members/SmartMemberCard";
import { motion } from "framer-motion";
import AppModal from "@/components/AppModal";
import { useSmartMatches } from "@/hooks/useSmartMatches";

type MemberPhoto = {
  url: string;
  id: string;
};

export default function SmartMatchesClient() {
  const [memberPhotos, setMemberPhotos] = useState<
    Record<string, MemberPhoto[]>
  >({});
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");
  const router = useRouter();
  const pageSize = 8;

  const { data, isLoading, isError, refetch } = useSmartMatches(page, pageSize);
  const memoizedMembers = useMemo(() => data?.items || [], [data?.items]);
  const totalCount = data?.totalCount || 0;

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/smart-matches/refresh-ai", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setModalContent("✅ ניתוח העדפות עודכן בהצלחה!");
        refetch();
      } else {
        setModalContent("❌ שגיאה בעדכון ניתוח.");
      }
    } catch (err) {
      console.log(err);
      setModalContent("❌ שגיאה ברשת או בשרת.");
    } finally {
      setRefreshing(false);
      setModalOpen(true);
    }
  };

  useEffect(() => {
    async function fetchMemberPhotos(members: Member[]) {
      try {
        const memberIds = members.map((m) => m.id);
        const response = await fetch(
          `/api/smart-matches/photos?ids=${memberIds.join(",")}`
        );
        if (response.ok) {
          const data = await response.json();
          setMemberPhotos(data.photos);
        }
      } catch (error) {
        console.error("Error fetching member photos:", error);
      }
    }

    if (memoizedMembers.length > 0) {
      fetchMemberPhotos(memoizedMembers);
    }
  }, [memoizedMembers]);

  function handleNextPage() {
    if (page * pageSize < totalCount) {
      setPage(page + 1);
    }
  }

  function handlePrevPage() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-8">
      <AppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        body={<p className="text-center text-sm">{modalContent}</p>}
      />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="mb-6 flex flex-col items-center gap-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-orange-800">
              החיבורים החכמים שלך
            </h1>
            <motion.button
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="px-6 py-2 bg-orange-400 text-white rounded-full hover:bg-orange-500 transition"
            >
              {refreshing ? "מרענן..." : "🔄 רענון ניתוח העדפות"}
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center text-orange-700 mb-6 max-w-xl"
          >
            התאמות אישיות שלומדות מההעדפות וההתנהגות שלך
          </motion.p>

          {isError && (
            <div className="text-red-600 text-sm text-center mb-6">
              שגיאה בטעינת התאמות.{" "}
              <button onClick={() => refetch()} className="underline">
                נסה שוב
              </button>
            </div>
          )}

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-orange-600 text-lg font-semibold"
            >
              טוען התאמות חכמות...
            </motion.div>
          ) : memoizedMembers.length > 0 ? (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch"
              >
                {memoizedMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    variants={item}
                    className="smart-member-card-container"
                  >
                    <SmartMemberCard
                      member={member}
                      memberPhotos={memberPhotos[member.id] || []}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-center mt-12 gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#FEF3C7" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border-2 border-amber-400 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 text-orange-700 font-medium"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  הקודם
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#FEF3C7" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border-2 border-amber-400 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 text-orange-700 font-medium"
                  onClick={handleNextPage}
                  disabled={page * pageSize >= totalCount}
                >
                  הבא
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-12 border-2 border-amber-300 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl w-full max-w-md"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.5,
                }}
              >
                <Sparkles className="h-16 w-16 text-amber-400 mb-4 inline-block" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4 text-orange-800">
                אין התאמות עדיין
              </h3>
              <p className="mb-6 text-orange-700 leading-relaxed">
                עליך לבקר בפרופילים ולסמן לייקים כדי שהמערכת תלמד את ההעדפות
                שלך. חיבורים חכמים יופיעו לאחר שתקיים מספר פעולות באפליקציה.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full hover:from-amber-500 hover:to-orange-500 transition-all font-medium shadow-md"
                onClick={() => router.push("/members")}
              >
                לדפדף בפרופילים
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
