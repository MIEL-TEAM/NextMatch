"use client";

import Image from "next/image";
import { transformImageUrl } from "@/lib/util";

interface StoryUser {
  id: string;
  name: string;
  image: string | null;
  hasUnviewedStories: boolean;
  totalStories: number;
  isCurrentUser?: boolean;
}

interface StoryRingProps {
  user: StoryUser;
  onClick: () => void;
}

export function StoryRing({ user, onClick }: StoryRingProps) {
  const ringStyle = user.hasUnviewedStories
    ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500" // Unviewed gradient
    : user.isCurrentUser && user.totalStories === 0
      ? "bg-gray-300" // Current user with no stories - will show plus
      : "bg-gray-300"; // Viewed stories

  const imageUrl = transformImageUrl(user.image);

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      {/* Story Ring */}
      <div
        className={`relative p-1 rounded-full cursor-pointer transition-transform hover:scale-105 ${ringStyle}`}
        onClick={onClick}
      >
        <div className="w-14 h-14 bg-white rounded-full p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden">
            <Image
              src={imageUrl || "/images/user.png"}
              alt={user.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Plus Icon for Current User with No Stories */}
        {user.isCurrentUser && user.totalStories === 0 && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
            +
          </div>
        )}
      </div>

      {/* User Name */}
      <span className="text-xs text-gray-600 mt-1 max-w-16 truncate text-center">
        {user.isCurrentUser ? "You" : user.name}
      </span>

      {/* Story Count Indicator */}
      {user.totalStories > 1 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {user.totalStories}
        </div>
      )}
    </div>
  );
}
