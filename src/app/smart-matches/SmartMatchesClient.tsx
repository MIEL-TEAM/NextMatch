"use client";

import { useEffect, useState, useMemo } from "react";
import { Member } from "@prisma/client";
import { Heart, Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import SmartMemberCard from "../members/SmartMemberCard";
import { motion, AnimatePresence } from "framer-motion";
import AppModal from "@/components/AppModal";
import { useSmartMatches } from "@/hooks/useSmartMatches";

type MemberPhoto = {
  url: string;
  id: string;
};

type EnhancedMember = Member & {
  matchReason?: string;
  matchScore?: number;
  premiumInsights?: string;
};

export default function SmartMatchesClient() {
  const [memberPhotos, setMemberPhotos] = useState<
    Record<string, MemberPhoto[]>
  >({});
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");
  const [showStats, setShowStats] = useState(false);
  const [filterScore, setFilterScore] = useState(0);
  const router = useRouter();
  const pageSize = 8;

  const { data, isLoading, isError, refetch } = useSmartMatches(page, pageSize);

  const memoizedMembers = useMemo(() => {
    const members = (data?.items as EnhancedMember[]) || [];

    // Filter by score if needed
    if (filterScore > 0) {
      return members.filter((m) => (m.matchScore || 0) >= filterScore);
    }

    return members;
  }, [data?.items, filterScore]);

  const totalCount = data?.totalCount || 0;

  // Calculate statistics
  const matchStats = useMemo(() => {
    const allMembers = (data?.items as EnhancedMember[]) || [];
    const scores = allMembers.map((m) => m.matchScore || 0);

    return {
      total: allMembers.length,
      perfect: allMembers.filter((m) => (m.matchScore || 0) >= 90).length,
      excellent: allMembers.filter(
        (m) => (m.matchScore || 0) >= 75 && (m.matchScore || 0) < 90
      ).length,
      good: allMembers.filter(
        (m) => (m.matchScore || 0) >= 60 && (m.matchScore || 0) < 75
      ).length,
      average:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
      highest: Math.round(Math.max(...scores, 0)),
    };
  }, [data?.items]);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/smart-matches/refresh-ai", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setModalContent(
          "✅ ניתוח העדפות עודכן בהצלחה! המערכת למדה מההתנהגות שלך ותציע התאמות טובות יותר."
        );
        refetch();
      } else {
        setModalContent("❌ שגיאה בעדכון ניתוח - נסה שוב מאוחר יותר.");
      }
    } catch (err) {
      console.log(err);
      setModalContent("❌ שגיאה ברשת או בשרת - בדוק את החיבור לאינטרנט.");
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 py-8">
      <AppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        body={
          <p className="text-center text-sm leading-relaxed">{modalContent}</p>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col items-center">
          {/* Premium Header */}
          <motion.div
            className="mb-8 flex flex-col items-center gap-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.h1
                className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                🧠 החיבורים החכמים שלך
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 mt-2"
              >
                מופעל על ידי בינה מלאכותית מתקדמת • מבוסס על ההעדפות שלך
              </motion.p>
            </div>

            {/* Control Panel */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <motion.button
                onClick={handleRefreshClick}
                disabled={refreshing}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {refreshing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    מעדכן...
                  </span>
                ) : (
                  "🔄 רענון ניתוח AI"
                )}
              </motion.button>

              <motion.button
                onClick={() => setShowStats(!showStats)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                סטטיסטיקות
              </motion.button>

              {/* Score Filter */}
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(Number(e.target.value))}
                className="px-4 py-3 rounded-full border-2 border-orange-200 bg-white text-gray-700 font-medium shadow-md focus:border-orange-400 focus:outline-none"
              >
                <option value={0}>כל ההתאמות</option>
                <option value={95}>זיווגים מושלמים (95%+)</option>
                <option value={90}>התאמות מעולות (90%+)</option>
                <option value={80}>התאמות טובות (80%+)</option>
              </select>
            </div>
          </motion.div>

          {/* Statistics Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 w-full max-w-4xl"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    📊 ניתוח ההתאמות שלך
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-gradient-to-b from-orange-100 to-orange-50 rounded-xl">
                      <div className="text-2xl font-bold text-orange-700">
                        {matchStats.perfect}
                      </div>
                      <div className="text-sm text-orange-600">
                        התאמות מעולות (90%+)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-amber-100 to-amber-50 rounded-xl">
                      <div className="text-2xl font-bold text-amber-700">
                        {matchStats.excellent}
                      </div>
                      <div className="text-sm text-amber-600">
                        התאמות טובות <br />
                        (75-89%)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-yellow-100 to-yellow-50 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-700">
                        {matchStats.good}
                      </div>
                      <div className="text-sm text-yellow-600">
                        פוטנציאל טוב <br />
                        (60-74%)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-600">
                        {matchStats.average}%
                      </div>
                      <div className="text-sm text-gray-600">ציון ממוצע</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-orange-200 to-orange-100 rounded-xl">
                      <div className="text-2xl font-bold text-orange-800">
                        {matchStats.highest}%
                      </div>
                      <div className="text-sm text-orange-700">הציון הגבוה</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 bg-red-50 border border-red-200 rounded-2xl mb-8 max-w-md"
            >
              <div className="text-red-600 text-lg font-medium mb-2">
                שגיאה בטעינת ההתאמות
              </div>
              <p className="text-red-500 text-sm mb-4">
                בעיה ברשת או בשרת - נסה שוב
              </p>
              <button
                onClick={() => refetch()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                נסה שוב
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
              </div>
              <div className="text-orange-600 text-xl font-semibold mb-2">
                🧠 המערכת מנתחת...
              </div>
              <div className="text-gray-600 text-sm">
                בודקת התאמות אישיות מתקדמות עבורך
              </div>
            </motion.div>
          ) : memoizedMembers.length > 0 ? (
            <>
              {/* Results Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 text-center"
              >
                <p className="text-gray-600">
                  נמצאו{" "}
                  <span className="font-bold text-orange-600">
                    {memoizedMembers.length}
                  </span>{" "}
                  התאמות איכותיות עבורך
                  {filterScore > 0 && ` (מעל ${filterScore}%)`}
                </p>
              </motion.div>

              {/* Members Grid */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch mb-12"
              >
                {memoizedMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={item}
                    className="smart-member-card-container"
                  >
                    <SmartMemberCard
                      member={member}
                      memberPhotos={memberPhotos[member.id] || []}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex justify-center items-center gap-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  ← הקודם
                </motion.button>

                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">
                    עמוד {page} מתוך {Math.ceil(totalCount / pageSize)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                  onClick={handleNextPage}
                  disabled={page * pageSize >= totalCount}
                >
                  הבא →
                </motion.button>
              </motion.div>
            </>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-12 border-2 border-dashed border-orange-300 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl w-full max-w-lg"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                }}
              >
                <Heart className="h-20 w-20 text-orange-400 mb-6 mx-auto" />
              </motion.div>

              <h3 className="text-3xl font-bold mb-4 text-orange-800">
                עדיין אין התאמות
              </h3>

              <p className="mb-8 text-orange-700 leading-relaxed text-lg">
                כדי שהמערכת תלמד את ההעדפות שלך ותמצא התאמות מושלמות, עליך:
              </p>

              <div className="space-y-4 mb-8 text-right">
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-orange-800">
                    לבקר בפרופילים של משתמשים
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-orange-800">
                    לסמן לייקים למי שמעניין אותך
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-orange-800">
                    לשלוח הודעות ולהתחיל שיחות
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full hover:from-orange-600 hover:to-pink-600 transition-all font-bold text-lg shadow-lg"
                onClick={() => router.push("/members")}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                התחל לדפדף בפרופילים
              </motion.button>

              <p className="mt-6 text-sm text-orange-600">
                ככל שתשתמש יותר, המערכת תלמד טוב יותר את ההעדפות שלך
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
