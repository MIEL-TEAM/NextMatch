"use client";

import { FiPlus } from "react-icons/fi";
import { CreateStoryButtonProps } from "@/types/stories";

export function CreateStoryButton({ onClick }: CreateStoryButtonProps) {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      {/* Create Button - Responsive sizing */}
      <div
        className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 md:hover:scale-105 shadow-lg touch-manipulation"
        onClick={onClick}
      >
        <FiPlus size={24} className="text-white" />
      </div>

      {/* Label - Responsive text */}
      <span className="text-[10px] md:text-xs text-gray-600 mt-1 text-center max-w-[56px] md:max-w-[64px] truncate leading-tight">
        הסטורי שלך
      </span>
    </div>
  );
}
