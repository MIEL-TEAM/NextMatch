"use client";

import { useFilters } from "@/hooks/useFilters";
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import FilterContent from "./FilterStyles";

export default function Filter() {
  const {
    orderByList,
    gendersList,
    selectAge,
    selectGender,
    selectOrder,
    filters,
    clientLoaded,
    isPending,
    selectWithPhoto,
    totalCount,
  } = useFilters();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (!isMounted) return null;

  return (
    <div className="relative">
      <div
        className="fixed bottom-4 right-4 z-[9999]"
        style={{
          position: "fixed",
          bottom: "5rem",
          right: "1rem",
          zIndex: 9999,
        }}
      >
        <Button
          isIconOnly
          color="secondary"
          size="lg"
          aria-label="Toggle Filter"
          onPress={toggleFilter}
          className="shadow-lg"
        >
          <FaFilter size={24} />
        </Button>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9000] flex justify-center items-start pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleFilter}
          >
            <motion.div
              className="bg-white z-[9001] rounded-lg shadow-lg w-full max-w-4xl m-4 p-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FilterContent
                orderByList={orderByList}
                gendersList={gendersList}
                selectAge={selectAge}
                selectGender={selectGender}
                selectOrder={selectOrder}
                filters={filters}
                clientLoaded={clientLoaded}
                isPending={isPending}
                selectWithPhoto={selectWithPhoto}
                totalCount={totalCount}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
