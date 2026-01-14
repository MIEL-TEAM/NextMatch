"use client";

import { useState } from "react";
import { StoriesCarousel } from "./StoriesCarousel";
import { StoryViewer } from "./StoryViewer";
import { CreateStoryModal } from "./CreateStoryModal";
import { getUserStories } from "@/app/actions/storyActions";
import { toast } from "sonner";
import { StoryWithUser } from "@/types/story";
import { StoriesContainerProps, StoryUser } from "@/types/stories";

export function StoriesContainer({ currentUserId }: StoriesContainerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentStories, setCurrentStories] = useState<StoryWithUser[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allStoryUsers, setAllStoryUsers] = useState<StoryUser[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const handleStoryClick = async (userId: string, allUsers?: StoryUser[]) => {
    try {
      const stories = await getUserStories(userId);

      if (stories.length === 0) {
        if (userId === currentUserId) {
          setShowCreateModal(true);
          return;
        }
        return;
      }

      // Remove duplicates based on story ID
      const uniqueStories = stories.filter(
        (story, index, self) =>
          index === self.findIndex((s) => s.id === story.id)
      );

      // Save all users for navigation
      if (allUsers) {
        setAllStoryUsers(allUsers);
        const userIndex = allUsers.findIndex((user) => user.id === userId);
        setCurrentUserIndex(userIndex >= 0 ? userIndex : 0);
      }

      setCurrentStories(uniqueStories);
      setCurrentStoryIndex(0);
      setShowViewer(true);
    } catch (error) {
      console.error("Error loading stories:", error);
      toast.error("Failed to load stories");
    }
  };

  const handleNextStory = async () => {
    if (currentUserIndex < allStoryUsers.length - 1) {
      const nextUser = allStoryUsers[currentUserIndex + 1];

      const stories = await getUserStories(nextUser.id);
      // Remove duplicates based on story ID
      const uniqueStories = stories.filter(
        (story, index, self) =>
          index === self.findIndex((s) => s.id === story.id)
      );

      if (uniqueStories.length > 0) {
        setCurrentStories(uniqueStories);
        setCurrentStoryIndex(0);
        setCurrentUserIndex(currentUserIndex + 1);
      }
    } else {
      setShowViewer(false);
    }
  };

  const handlePreviousStory = async () => {
    if (currentUserIndex > 0) {
      const prevUser = allStoryUsers[currentUserIndex - 1];

      const stories = await getUserStories(prevUser.id);
      // Remove duplicates based on story ID
      const uniqueStories = stories.filter(
        (story, index, self) =>
          index === self.findIndex((s) => s.id === story.id)
      );

      if (uniqueStories.length > 0) {
        setCurrentStories(uniqueStories);
        setCurrentStoryIndex(0);
        setCurrentUserIndex(currentUserIndex - 1);
      }
    }
  };

  const handleStoryCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStoryDeleted = (storyId: string) => {
    // Remove the deleted story from current stories
    setCurrentStories((prev) => prev.filter((story) => story.id !== storyId));

    // If no more stories, close viewer
    if (currentStories.length <= 1) {
      setShowViewer(false);
      return;
    }

    // Adjust current index if needed
    if (currentStoryIndex >= currentStories.length - 1) {
      setCurrentStoryIndex(currentStories.length - 2);
    }

    // Refresh the carousel
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <StoriesCarousel
        onStoryClick={(userId, allUsers) => handleStoryClick(userId, allUsers)}
        onCreateStory={() => setShowCreateModal(true)}
        refreshKey={refreshTrigger}
        currentUserId={currentUserId}
      />
      <StoryViewer
        isOpen={showViewer}
        stories={currentStories}
        currentStoryIndex={currentStoryIndex}
        onClose={() => setShowViewer(false)}
        onNext={handleNextStory}
        onPrevious={handlePreviousStory}
        currentUserId={currentUserId}
        onStoryDeleted={handleStoryDeleted}
      />
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={handleStoryCreated}
      />
    </>
  );
}
