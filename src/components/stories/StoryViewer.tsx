"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiX, FiTrash2 } from "react-icons/fi";
import { StoryProgressBar } from "./StoryProgressBar";
import { StoryMessageModal } from "./StoryMessageModal";
import { StoryAnalytics } from "./StoryAnalytics";
import { StoryViewerProps } from "@/types/stories";
import AppModal from "../AppModal";
import { Heart, Smile, Flame, HeartHandshake } from "lucide-react";
import { toast } from "sonner";

const reactions = [
  { id: "love", icon: Heart, emoji: "❤️", label: "אהבה" },
  { id: "funny", icon: Smile, emoji: "😄", label: "מצחיק" },
  { id: "fire", icon: Flame, emoji: "🔥", label: "אש" },
  { id: "care", icon: HeartHandshake, emoji: "🤝", label: "אכפתיות" },
];

export function StoryViewer({
  isOpen,
  stories,
  currentStoryIndex,
  onClose,
  onNext,
  onPrevious,
  currentUserId,
  onStoryDeleted,
}: StoryViewerProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const progressRef = useRef<NodeJS.Timeout>();
  const STORY_DURATION = 5000;

  const currentStory = stories?.[currentStoryIndex];

  useEffect(() => {
    setImageLoaded(false);
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = undefined;
    }
    setProgress(0);
  }, [currentStoryIndex, currentStory?.imageUrl]);

  const handleDeleteStory = async () => {
    if (!currentStory) return;

    try {
      const { deleteStory } = await import("@/app/actions/storyActions");
      const result = await deleteStory(currentStory.id);

      if (result.status === "success") {
        onStoryDeleted?.(currentStory.id);
        onClose();
      } else {
        console.error("Failed to delete story:", result.error);
      }
    } catch (error) {
      console.error("Failed to delete story:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      } else if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        onNext();
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onNext, onPrevious, onClose]);

  useEffect(() => {
    if (!isOpen || !currentStory || showMessageModal || !imageLoaded) return;

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
    showMessageModal,
    onNext,
    onClose,
    currentStory,
    imageLoaded,
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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative flex items-center gap-4">
          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="w-12 h-12 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm z-20"
            aria-label="Previous story"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Main Story Container */}
          <div className="relative w-[28rem] h-[650px] bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Top Gradient Overlay for better text visibility */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-[5] pointer-events-none" />

            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex gap-1">
                {stories.map((_, index) => (
                  <StoryProgressBar
                    key={`${index}-${currentStoryIndex}`}
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
            </div>

            <div className="absolute top-12 left-4 right-4 z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/members/${currentStory.user.id}`);
                  }}
                  className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  <Image
                    src={currentStory.user.image || "/images/user.png"}
                    alt={currentStory.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/members/${currentStory.user.id}`);
                  }}
                  className="text-left hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <p
                    className="text-white font-semibold text-sm"
                    style={{
                      textShadow:
                        "0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)",
                    }}
                  >
                    {currentStory.user.name || "Unknown User"}
                  </p>
                  <p
                    className="text-gray-200 text-xs"
                    style={{
                      textShadow:
                        "0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,1)",
                    }}
                  >
                    {new Date(currentStory.createdAt).toLocaleTimeString()}
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <StoryAnalytics
                  storyId={currentStory.id}
                  isCurrentUserStory={currentStory.user.id === currentUserId}
                />
                {currentStory.user.id === currentUserId && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-8 h-8 bg-red-600 bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                    title="מחק סטורי"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Story Image */}
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={handleTap}
            >
              <Image
                src={currentStory.imageUrl}
                alt="Story"
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority
                onLoadingComplete={() => setImageLoaded(true)}
              />

              {!imageLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                  </div>
                </div>
              )}

              {currentStory.textOverlay && (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${(currentStory.textX || 0.5) * 100}%`,
                    top: `${(currentStory.textY || 0.5) * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <p
                    className="text-white text-lg font-bold text-center px-4 py-3 bg-black/70 rounded-xl max-w-xs backdrop-blur-md"
                    style={{
                      textShadow:
                        "0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,1)",
                    }}
                  >
                    {currentStory.textOverlay}
                  </p>
                </div>
              )}

              {/* Reactions & Message Input */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="flex justify-center gap-4 mb-4">
                  {reactions.map(({ id, icon: Icon, emoji, label }) => (
                    <button
                      key={id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { sendStoryMessage } = await import(
                            "@/app/actions/storyActions"
                          );
                          const result = await sendStoryMessage(
                            currentStory.id,
                            id
                          );

                          if (result.status === "success") {
                            toast.success(
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{emoji}</span>
                                <span>התגובה נשלחה בהצלחה!</span>
                              </div>,
                              {
                                duration: 2000,
                                style: {
                                  background:
                                    "linear-gradient(to right, #F59E0B, #EA580C)",
                                  color: "#fff",
                                  fontWeight: "600",
                                },
                              }
                            );
                          } else {
                            toast.error("אירעה שגיאה בשליחת התגובה");
                          }
                        } catch {
                          toast.error("אירעה שגיאה בשליחת התגובה");
                        }
                      }}
                      className="w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm active:scale-95"
                      title={label}
                    >
                      <Icon className="w-5 h-5 text-white" />
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

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="w-12 h-12 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm z-20"
            aria-label="Next story"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
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

      <AppModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        header="מחק סטורי?"
        body={
          <p className="text-gray-600">
            האם אתה בטוח שברצונך למחוק את הסטורי הזה? פעולה זו לא ניתנת לביטול.
          </p>
        }
        footerButtons={[
          {
            children: "ביטול",
            variant: "bordered",
            onClick: () => setShowDeleteConfirm(false),
          },
          {
            children: "מחק",
            color: "danger",
            onClick: () => {
              setShowDeleteConfirm(false);
              handleDeleteStory();
            },
          },
        ]}
      />
    </div>
  );
}
