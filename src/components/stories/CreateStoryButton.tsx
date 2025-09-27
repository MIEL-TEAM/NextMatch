"use client";

import { FiPlus } from "react-icons/fi";

interface CreateStoryButtonProps {
  onClick: () => void;
}

export function CreateStoryButton({ onClick }: CreateStoryButtonProps) {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      {/* Create Button */}
      <div
        className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shadow-lg"
        onClick={onClick}
      >
        <FiPlus size={24} className="text-white" />
      </div>

      {/* Label */}
      <span className="text-xs text-gray-600 mt-1 text-center">Your Story</span>
    </div>
  );
}
