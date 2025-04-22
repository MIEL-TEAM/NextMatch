"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Member } from "@prisma/client";
import { getSmartMatches } from "../actions/smartMatchActions";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeartLoading from "@/components/HeartLoading";
import { motion, AnimatePresence } from "framer-motion";

const SmartMemberCard = dynamic(() => import("../members/SmartMemberCard"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-amber-50 animate-pulse rounded-lg" />
  ),
});

type MemberPhoto = {
  url: string;
  id: string;
};

export default function OptimizedSmartMatchesClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [memberPhotos, setMemberPhotos] = useState<
    Record<string, MemberPhoto[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const pageSize = 8;

  const fetchMemberPhotos = useCallback(async (members: Member[]) => {
    try {
      const memberIds = members.map((m) => m.id);
      if (memberIds.length === 0) return;

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
  }, []);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSmartMatches(
        page.toString(),
        pageSize.toString()
      );
      setMembers(result.items);
      setTotalCount(result.totalCount);

      if (result.items.length > 0) {
        await fetchMemberPhotos(result.items);
      }
    } catch (error) {
      console.error("Error loading smart matches:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, fetchMemberPhotos]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (page * pageSize < totalCount) {
      const preloadNextPage = async () => {
        try {
          await getSmartMatches((page + 1).toString(), pageSize.toString());
        } catch (error) {
          console.log(error);
        }
      };

      if (totalCount - page * pageSize < pageSize * 3) {
        preloadNextPage();
      }
    }
  }, [page, pageSize, totalCount]);

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

  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    }),
    []
  );

  const item = useMemo(
    () => ({
      hidden: { y: 20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300 },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="relative mb-6 flex items-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-orange-800">
              החיבורים החכמים שלך
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -right-10 top-0"
            >
              <Sparkles className="h-8 w-8 text-amber-400" />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center text-orange-700 mb-10 max-w-xl"
          >
            התאמות אישיות שלומדות מההעדפות וההתנהגות שלך
          </motion.p>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col justify-center items-center h-64"
            >
              <HeartLoading />
            </motion.div>
          ) : members.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${page}`}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                >
                  {members.map((member, index) => (
                    <motion.div key={member.id} variants={item} custom={index}>
                      <SmartMemberCard
                        member={member}
                        memberPhotos={memberPhotos[member.id] || []}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex justify-center mt-12 gap-4"
              >
                <button
                  className="px-6 py-3 border-2 border-amber-400 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 text-orange-700 font-medium"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  הקודם
                </button>
                <button
                  className="px-6 py-3 border-2 border-amber-400 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 text-orange-700 font-medium"
                  onClick={handleNextPage}
                  disabled={page * pageSize >= totalCount}
                >
                  הבא
                </button>
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
              <button
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full hover:from-amber-500 hover:to-orange-500 transition-all font-medium shadow-md"
                onClick={() => router.push("/members")}
              >
                לדפדף בפרופילים
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
