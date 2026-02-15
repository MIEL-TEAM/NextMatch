"use client";

import { useState, useMemo } from "react";
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
  matchReason?: { text: string; tags: string[] } | string;
  matchScore?: number;
  premiumInsights?: string;
  photos?: MemberPhoto[];
};

export default function SmartMatchesClient() {
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

  const matchText =
    memoizedMembers.length === 1
      ? "נמצאה התאמה מושלמת אחת עבורך"
      : `נמצאו ${memoizedMembers.length} התאמות איכותיות עבורך`;

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-8">
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
        className="px-4 sm:px-7 w-screen"
      >
        <div className="flex flex-col items-center">
          {/* Premium Header */}
          <motion.div
            className="mb-10 flex flex-col items-center gap-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
              >
                החיבורים החכמים שלך
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-500 mt-3 font-light"
              >
                מופעל על ידי בינה מלאכותית • מותאם אישית אליך
              </motion.p>
            </div>

            {/* Control Panel */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
              <motion.button
                onClick={handleRefreshClick}
                disabled={refreshing}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium text-sm shadow-sm disabled:opacity-50 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>מעדכן...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>רענון AI</span>
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={() => setShowStats(!showStats)}
                className={`px-6 py-2.5 rounded-full transition-all font-medium text-sm shadow-sm flex items-center gap-2 border ${showStats
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="w-3 h-3" />
                סטטיסטיקות
              </motion.button>

              {/* Score Filter - Custom Minimal Select */}
              <div className="relative">
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(Number(e.target.value))}
                  className="appearance-none px-4 py-2.5 pr-8 pl-4 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-medium shadow-sm focus:border-gray-400 focus:outline-none cursor-pointer hover:border-gray-300"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 0.7rem center",
                    backgroundSize: "1em",
                  }}
                >
                  <option value={0}>כל ההתאמות</option>
                  <option value={90}>התאמות מושלמות (90%+)</option>
                  <option value={80}>התאמות טובות (80%+)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Statistics Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full max-w-4xl overflow-hidden"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                    ניתוח ההתאמות שלך
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.perfect}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        מושלמות (90%+)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.excellent}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        מצוינות (75%+)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.good}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        טובות (60%+)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.average}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ציון ממוצע
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {matchStats.highest}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        הכי גבוה
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 bg-red-50 border border-red-100 rounded-2xl mb-8 max-w-md"
            >
              <div className="text-red-600 font-medium mb-2">
                שגיאה בטעינת ההתאמות
              </div>
              <button
                onClick={() => refetch()}
                className="text-sm underline text-red-500 hover:text-red-700"
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
              className="text-center py-24"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full"></div>
              </div>
              <div className="text-gray-400 text-sm">מחפש התאמות...</div>
            </motion.div>
          ) : memoizedMembers.length > 0 ? (
            <>
              {/* Results Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <p className="text-gray-500 text-sm">
                  {matchText}
                  {filterScore > 0 && ` (מעל ${filterScore}%)`}
                </p>
              </motion.div>

              {/* Members Grid - Refactored to Grid for responsive 5 columns */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full mb-16 items-start"
              >
                {memoizedMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={item}
                    className="smart-member-card-container w-full"
                  >
                    <SmartMemberCard
                      member={member}
                      memberPhotos={member.photos || []}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {Math.ceil(totalCount / pageSize) > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center gap-4"
                >
                  <button
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    → הקודם
                  </button>

                  <span className="text-gray-400 text-sm font-medium">
                    {page} / {Math.ceil(totalCount / pageSize)}
                  </span>

                  <button
                    className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    onClick={handleNextPage}
                    disabled={page * pageSize >= totalCount}
                  >
                    הבא  ←
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center p-12 max-w-lg mx-auto"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-900">
                עדיין אין התאמות
              </h3>

              <p className="mb-8 text-gray-500 text-sm leading-relaxed">
                המערכת לומדת את ההעדפות שלך תוך כדי תנועה.
                <br />
                התחל לדפדף כדי לעזור לנו למצוא לך התאמות.
              </p>

              <button
                className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium text-sm shadow-lg"
                onClick={() => router.push("/members")}
              >
                התחל לדפדף
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
