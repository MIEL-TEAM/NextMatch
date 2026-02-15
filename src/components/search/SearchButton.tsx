"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { IoIosSearch } from "react-icons/io";

import SearchModal from "./SearchModal";

interface SearchButtonProps {
  className?: string;
}

export default function SearchButton({
  className = "",
}: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsSearchOpen(true)}
        className={`
          relative flex items-center justify-center
          w-10 h-10 sm:w-9 sm:h-9
          rounded-full
          bg-white/20
          backdrop-blur-md
          shadow-md
          border border-white/20
          hover:bg-white/30
          transition-all
          ${className}
        `}
        aria-label="חיפוש"
      >
        <IoIosSearch className="text-xl text-white" />
      </motion.button>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
