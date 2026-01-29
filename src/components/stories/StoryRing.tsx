"use client";

import Image from "next/image";
import { transformImageUrl } from "@/lib/util";
import { StoryRingProps } from "@/types/stories";

export function StoryRing({ user, onClick }: StoryRingProps) {
  const ringStyle = user.hasUnviewedStories
    ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
    : user.isCurrentUser && user.totalStories === 0
      ? ""
      : "bg-gray-300";

  const imageUrl = transformImageUrl(user.image);

  return (
    <div className="relative flex flex-col items-center flex-shrink-0">
      {/* Story Ring - Responsive sizing */}
      <div
        className={`relative ${user.isCurrentUser && user.totalStories === 0 ? "" : "p-0.5 md:p-1"} rounded-full cursor-pointer transition-transform active:scale-95 md:hover:scale-105 ${ringStyle}`}
        onClick={onClick}
      >
        <div
          className={`w-14 h-14 md:w-16 md:h-16 ${user.isCurrentUser && user.totalStories === 0 ? "" : "bg-white rounded-full p-0.5"}`}
        >
          <div className="w-full h-full rounded-full overflow-hidden">
            <Image
              src={imageUrl || "/images/user.png"}
              alt={user.name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Plus Icon for Current User with No Stories */}
        {user.isCurrentUser && user.totalStories === 0 && (
          <div className="absolute bottom-0 right-0 bg-gradient-to-r from-[#F6D365] to-[#E37B27] text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-md">
            +
          </div>
        )}
      </div>
      {/* User Name - Responsive text */}
      <span className="text-[10px] md:text-xs text-gray-600 mt-1 max-w-[56px] md:max-w-[64px] truncate text-center leading-tight">
        {user.isCurrentUser ? "הסטורי שלך" : user.name}
      </span>
    </div>
  );
}
