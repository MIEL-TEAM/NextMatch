"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilters } from "@/hooks/useFilters";

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

  const { selectOrder } = useFilters();

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);

    if (!filter) return;

    switch (filter) {
      case "all":
        selectOrder(new Set(["newest"]));
        const allParams = new URLSearchParams(searchParams.toString());
        allParams.set("filter", filter);
        allParams.set("onlineOnly", "false");
        router.push(`?${allParams.toString()}`);
        router.refresh();

        break;

      case "online":
        selectOrder(new Set(["updated"]));
        const onlineParams = new URLSearchParams(searchParams.toString());
        onlineParams.set("filter", filter);
        onlineParams.set("onlineOnly", "true");
        router.push(`?${onlineParams.toString()}`);
        break;

      default:
        const params = new URLSearchParams(searchParams.toString());
        params.set("filter", filter);
        params.set("onlineOnly", "false");
        router.push(`?${params.toString()}`);
    }
  };
  return (
    <motion.div
      className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2 sm:px-0 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
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
    </motion.div>
  );
};

export default FilterButtons;
