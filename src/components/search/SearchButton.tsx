"use client";

import { useState } from "react";
import { Button } from "@nextui-org/react";
import { HiSearch } from "react-icons/hi";
import SearchModal from "./SearchModal";

interface SearchButtonProps {
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
}

export default function SearchButton({
  userLocation,
  className = "",
}: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <Button
        isIconOnly
        variant="light"
        className={`text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all ${className}`}
        onPress={() => setIsSearchOpen(true)}
        aria-label="חיפוש"
      >
        <HiSearch className="text-2xl" />
      </Button>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userLocation={userLocation}
      />
    </>
  );
}
