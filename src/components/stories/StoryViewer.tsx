"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { StoryProgressBar } from "./StoryProgressBar";
import { StoryMessageModal } from "./StoryMessageModal";
import { StoryAnalytics } from "./StoryAnalytics";

interface Story {
  id: string;
  imageUrl: string;
  textOverlay?: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface StoryViewerProps {
  isOpen: boolean;
  stories: Story[];
  currentStoryIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentUserId?: string;
}

export function StoryViewer({
  isOpen,
  stories,
  currentStoryIndex,
  onClose,
  onNext,
  onPrevious,
  currentUserId,
}: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPreview] = useState(true);
  const [floatingEmojis, setFloatingEmojis] = useState<
    Array<{
      id: string;
      emoji: string;
      x: number;
      y: number;
      delay: number;
      duration: number;
    }>
  >([]);
  const progressRef = useRef<NodeJS.Timeout>();
  const STORY_DURATION = 5000;

  const currentStory = stories[currentStoryIndex];
  const nextStory =
    currentStoryIndex < stories.length - 1
      ? stories[currentStoryIndex + 1]
      : null;
  const prevStory =
    currentStoryIndex > 0 ? stories[currentStoryIndex - 1] : null;

  const handleNextWithTransition = useCallback(() => {
    onNext();
  }, [onNext]);

  const handlePreviousWithTransition = useCallback(() => {
    onPrevious();
  }, [onPrevious]);

  const createFloatingEmoji = (emoji: string) => {
    const newEmoji = {
      id: `${Date.now()}`,
      emoji,
      x: 160,
      y: 300,
      delay: 0,
      duration: 1200,
    };

    setFloatingEmojis((prev) => [...prev, newEmoji]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 1200);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePreviousWithTransition();
          break;
        case "ArrowRight":
        case " ":
          event.preventDefault();
          handleNextWithTransition();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, handleNextWithTransition, handlePreviousWithTransition, onClose]);

  useEffect(() => {
    if (!isOpen || isPaused || !currentStory || showMessageModal) return;

    setProgress(0);
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(progressRef.current!);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [
    isOpen,
    currentStoryIndex,
    isPaused,
    showMessageModal,
    onNext,
    onClose,
    currentStory,
  ]);

  const handleTap = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      onPrevious();
    } else {
      onNext();
    }
  };

  if (
    !isOpen ||
    !currentStory ||
    stories.length === 0 ||
    currentStoryIndex >= stories.length
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 z-[9999] overflow-hidden">
      <div className="absolute inset-0" />
      <div
        className="relative w-full h-full flex items-center justify-center gap-6"
        style={{ perspective: "1200px" }}
      >
        {prevStory && showPreview && (
          <div
            className="relative w-24 h-32 bg-black rounded-lg overflow-hidden shadow-lg opacity-40 transform scale-75 cursor-pointer hover:opacity-60 transition-all duration-200"
            onClick={handlePreviousWithTransition}
          >
            <Image
              src={prevStory.imageUrl}
              alt="Previous story"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePreviousWithTransition();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="relative w-80 h-[600px] bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex gap-1">
              {stories.map((_, index) => (
                <StoryProgressBar
                  key={index}
                  progress={
                    index === currentStoryIndex
                      ? progress
                      : index < currentStoryIndex
                        ? 100
                        : 0
                  }
                />
              ))}
            </div>

            {showMessageModal && (
              <div className="flex justify-center mt-2">
                <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  ⏸️ מושהה
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-12 left-4 right-4 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={currentStory.user.image || "/images/user.png"}
                  alt={currentStory.user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-lg"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm drop-shadow-lg">
                  {currentStory.user.name || "Unknown User"}
                </p>
                <p className="text-gray-200 text-xs drop-shadow-lg">
                  {new Date(currentStory.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StoryAnalytics
                storyId={currentStory.id}
                isCurrentUserStory={currentStory.user.id === currentUserId}
              />
              <button
                onClick={onClose}
                className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          <div
            className="relative w-full h-full cursor-pointer"
            onClick={handleTap}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <Image
              src={currentStory.imageUrl}
              alt="Story"
              fill
              className="object-cover"
              priority
            />

            {currentStory.textOverlay && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-white text-lg font-bold text-center px-4 py-3 bg-black bg-opacity-60 rounded-xl max-w-xs backdrop-blur-sm drop-shadow-lg">
                  {currentStory.textOverlay}
                </p>
              </div>
            )}

            {floatingEmojis.map((floatingEmoji) => (
              <div
                key={floatingEmoji.id}
                className="absolute pointer-events-none text-6xl z-30 animate-gentle-pop"
                style={{
                  left: `${floatingEmoji.x}px`,
                  top: `${floatingEmoji.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {floatingEmoji.emoji}
              </div>
            ))}

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex justify-center gap-4 mb-4">
                {["😍", "😂", "🔥", "❤️"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={async (e) => {
                      e.stopPropagation();

                      createFloatingEmoji(emoji);

                      const { sendStoryMessage } = await import(
                        "@/app/actions/storyActions"
                      );
                      await sendStoryMessage(currentStory.id, emoji);
                    }}
                    className="w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="שלח הודעה..."
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMessageModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-black bg-opacity-40 text-white placeholder-gray-300 rounded-full border border-white border-opacity-20 backdrop-blur-sm focus:outline-none focus:border-orange-400"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNextWithTransition();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {nextStory && showPreview && (
          <div
            className="relative w-24 h-32 bg-black rounded-lg overflow-hidden shadow-lg opacity-40 transform scale-75 cursor-pointer hover:opacity-60 transition-all duration-200"
            onClick={handleNextWithTransition}
          >
            <Image
              src={nextStory.imageUrl}
              alt="Next story"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
          </div>
        )}
      </div>

      <StoryMessageModal
        isOpen={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setProgress(0);
        }}
        storyId={currentStory.id}
        storyImageUrl={currentStory.imageUrl}
        storyOwnerName={currentStory.user.name || "Unknown User"}
        storyOwnerImage={currentStory.user.image}
      />
    </div>
  );
}
