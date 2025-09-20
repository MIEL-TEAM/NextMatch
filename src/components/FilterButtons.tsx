"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterButtonsProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  setActiveFilter,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // אין צורך ב-useFilters כי אנחנו מעדכנים רק את ה-URL

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);

    if (!filter) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);

    switch (filter) {
      case "all":
        // עבור "הכל" - הכי חדשים
        params.set("orderBy", "newest");
        params.set("onlineOnly", "false");
        break;

      case "new":
        // עבור "חדשים" - לפי תאריך הרשמה
        params.set("orderBy", "newest");
        params.set("onlineOnly", "false");
        break;

      case "online":
        // עבור "מחוברים עכשיו" - לפי פעילות אחרונה
        params.set("orderBy", "updated");
        params.set("onlineOnly", "true");
        break;

      case "nearby":
        // עבור "קרובים אליך" - לפי מרחק (אם יש מיקום)
        const hasLocation =
          searchParams.get("userLat") && searchParams.get("userLon");
        if (hasLocation) {
          params.set("orderBy", "distance");
          params.set("sortByDistance", "true");
        } else {
          // אם אין מיקום, נציג לפי עדכון אחרון
          params.set("orderBy", "updated");
        }
        params.set("onlineOnly", "false");
        break;

      default:
        params.set("onlineOnly", "false");
    }

    // עדכון ה-URL בלי ריענון העמוד
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 mb-6 sm:mb-8 px-2 sm:px-0 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div className="flex justify-center gap-2 sm:gap-3">
        {["all", "new", "online", "nearby"].map((filter) => (
          <motion.button
            key={filter}
            className={`min-w-[80px] px-3 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm sm:text-sm font-medium transition-all ${
              activeFilter === filter
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
                : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm"
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => handleFilterChange(filter)}
          >
            {filter === "all" && "הכל"}
            {filter === "new" && "חדשים"}
            {filter === "online" && "מחוברים עכשיו"}
            {filter === "nearby" && "קרובים אליך"}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default FilterButtons;
