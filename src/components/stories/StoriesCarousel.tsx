"use client";

import { useState, useEffect } from "react";
import { StoryRing } from "./StoryRing";
import { CreateStoryButton } from "./CreateStoryButton";
import { getStoryUsers } from "@/app/actions/storyActions";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher-client";

interface StoryUser {
  id: string;
  name: string;
  image: string | null;
  hasUnviewedStories: boolean;
  totalStories: number;
  isCurrentUser?: boolean;
}

interface StoriesCarouselProps {
  onStoryClick: (userId: string, allUsers?: StoryUser[]) => void;
  onCreateStory: () => void;
  refreshKey?: number;
  currentUserId?: string;
}

export function StoriesCarousel({
  onStoryClick,
  onCreateStory,
  refreshKey,
  currentUserId,
}: StoriesCarouselProps) {
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

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

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  const currentUser = storyUsers.find((user) => user.isCurrentUser);
  const otherUsers = storyUsers.filter((user) => !user.isCurrentUser);

  return (
    <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
      {currentUser ? (
        <StoryRing
          key={currentUser.id}
          user={currentUser}
          onClick={() => onStoryClick(currentUser.id, storyUsers)}
        />
      ) : (
        <CreateStoryButton onClick={onCreateStory} />
      )}

      {otherUsers.length > 0
        ? otherUsers.map((user) => (
            <StoryRing
              key={user.id}
              user={user}
              onClick={() => onStoryClick(user.id, storyUsers)}
            />
          ))
        : !currentUser && (
            <div className="flex items-center justify-center text-gray-500 text-sm px-4">
              No stories yet. Be the first to share!
            </div>
          )}
    </div>
  );
}
