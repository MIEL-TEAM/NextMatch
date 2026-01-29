"use client";

import { useState, useEffect, useRef } from "react";
import { StoryRing } from "./StoryRing";
import { CreateStoryButton } from "./CreateStoryButton";
import { getStoryUsers } from "@/app/actions/storyActions";
import { useServerSession } from "@/contexts/SessionContext";
import { getPusherClient } from "@/lib/pusher-client";
import { StoryUser, StoriesCarouselProps } from "@/types/stories";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

export function StoriesCarousel({
  onStoryClick,
  onCreateStory,
  refreshKey,
  currentUserId,
}: StoriesCarouselProps) {
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { session } = useServerSession();

  useEffect(() => {
    fetchStoryUsers();
  }, [refreshKey]);

  useEffect(() => {
    const userId = currentUserId || session?.user?.id;
    if (!userId) return;

    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(`private-${userId}`);

    const handleStoryViewed = () => {
      fetchStoryUsers();
    };

    const handleStoryCreated = () => {
      fetchStoryUsers();
    };

    channel.bind("story:viewed", handleStoryViewed);
    channel.bind("story:created", handleStoryCreated);

    return () => {
      channel.unbind("story:viewed", handleStoryViewed);
      channel.unbind("story:created", handleStoryCreated);
    };
  }, [currentUserId, session?.user?.id]);

  const fetchStoryUsers = async () => {
    try {
      const users = await getStoryUsers();
      setStoryUsers(users);
    } catch (error) {
      console.error("Error fetching story users:", error);
      setStoryUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Check scrollability when users change
  useEffect(() => {
    if (!loading) {
      checkScrollability();
    }
  }, [loading, storyUsers]);

  if (loading) {
    return (
      <div className="relative">
        <div className="flex gap-2 md:gap-3 px-3 md:px-6 py-3 md:py-4 overflow-x-auto scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const currentUser = storyUsers.find((user) => user.isCurrentUser);
  const otherUsers = storyUsers.filter((user) => !user.isCurrentUser);

  return (
    <div className="relative">
      {/* Left Arrow - Hidden on mobile */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="hidden md:block absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-colors duration-200 drop-shadow-lg"
          style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
          aria-label="Scroll left"
        >
          <MdOutlineKeyboardArrowLeft size={40} />
        </button>
      )}

      {/* Right Arrow - Hidden on mobile */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="hidden md:block absolute right-[-10px] top-[50px] transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-colors duration-200 drop-shadow-lg"
          style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
          aria-label="Scroll right"
        >
          <MdOutlineKeyboardArrowRight size={40} />
        </button>
      )}

      {/* Fade Effects - Reduced on mobile */}
      <div className="absolute left-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-5 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-5 pointer-events-none" />

      {/* Stories Container - Optimized for mobile */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 md:gap-3 px-3 md:px-8 py-3 md:py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        onScroll={checkScrollability}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {currentUser ? (
          <div className="flex-shrink-0 snap-start">
            <StoryRing
              key={currentUser.id}
              user={currentUser}
              onClick={() => onStoryClick(currentUser.id, storyUsers)}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 snap-start">
            <CreateStoryButton onClick={onCreateStory} />
          </div>
        )}

        {otherUsers.length > 0
          ? otherUsers.map((user) => (
              <div key={user.id} className="flex-shrink-0 snap-start">
                <StoryRing
                  user={user}
                  onClick={() => onStoryClick(user.id, storyUsers)}
                />
              </div>
            ))
          : !currentUser && (
              <div className="flex items-center justify-center text-gray-500 text-sm px-4">
                אין כאן סיפורים עדיין. זה הזמן לשתף משהו משלך!
              </div>
            )}
      </div>
    </div>
  );
}
