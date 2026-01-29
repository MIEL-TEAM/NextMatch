"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FiX, FiSend } from "react-icons/fi";
import { StoryProgressBar } from "./StoryProgressBar";
import { StoryViewerProps } from "@/types/stories";
import { sendStoryMessage } from "@/app/actions/storyActions";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StoryViewer({
  isOpen,
  stories,
  currentStoryIndex,
  onClose,
  onNext,
  onPrevious,

}: StoryViewerProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
  
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

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
    if (!isOpen || !currentStory || !imageLoaded) return;

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

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !currentStory) return;

    setIsLoading(true);
    try {
      const result = await sendStoryMessage(currentStory.id, message.trim());

      if (result.status === "success") {
        onClose();
        router.push(`/members/${result.data.userId}/chat`);
      } else if (result.status === "error") {
        const errorMessage = Array.isArray(result.error)
          ? result.error.map(err => err.message).join(", ")
          : result.error || "Error sending message";
      
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error("Error sending story message:", error);
      toast.error("Error sending message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="fixed inset-0 bg-black/50 z-[9999] overflow-hidden">
      <div className="relative w-full h-full md:flex md:items-center md:justify-center">
        <div className="relative flex items-center gap-2 md:gap-4 w-full h-full md:w-auto md:h-auto">
          {/* Left Arrow - Hidden on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="hidden md:flex w-12 h-12 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm z-20"
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

          {/* Main Story Container - Full screen on mobile, fixed size on desktop */}
          <div className="relative w-full h-full md:w-[28rem] md:h-[650px] md:max-w-[28rem] md:max-h-[650px] bg-black md:rounded-2xl overflow-hidden md:shadow-2xl flex flex-col">
            {/* Top Gradient Overlay for better text visibility */}
            <div className="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-[1] pointer-events-none" />

            {/* Progress bars and header - Fixed at top */}
            <div className="relative z-50 flex-shrink-0">
              {/* Progress bars */}
              <div className="pt-20 md:pt-4 px-3">
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
              
              {/* User info and close button */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden">
                    <Link href={`/members/${currentStory.user.id}`}>
                    <Image
                      src={currentStory.user.image || "/images/user.png"}
                      alt={currentStory.user.name || "User"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                    </Link>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {currentStory.user.name || "Unknown User"}
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="text-white"
                >
                  <FiX size={28} />
                </button>
              </div>
            </div>

            {/* Story Image - Flexible middle section */}
            <div
              className="relative flex-1 cursor-pointer select-none overflow-hidden"
              onClick={handleTap}
            >
              <div className="relative w-full h-full">
                <Image
                  src={currentStory.imageUrl}
                  alt="Story"
                  fill
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className={`object-contain md:object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  priority
                  onLoadingComplete={() => setImageLoaded(true)}
                />
              </div>

              {!imageLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Text below image */}
            {currentStory.textOverlay && (
              <div className="relative z-50 flex-shrink-0 px-4 py-3">
                <p className="text-white text-sm md:text-base text-center">
                  {currentStory.textOverlay}
                </p>
              </div>
            )}

            {/* Message Input - Fixed at bottom */}
            <div className="relative z-50 flex-shrink-0 p-4 pb-6">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isLoading}
                  className="flex-1 px-6 py-2 bg-transparent text-white placeholder-white/70 rounded-full border-2 border-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendMessage();
                  }}
                  disabled={!message.trim() || isLoading}
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSend size={24} className="text-white" />
                  )}
                </button>
              </div>
            </div>
            </div>

          {/* Right Arrow - Hidden on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="hidden md:flex w-12 h-12 bg-white bg-opacity-15 hover:bg-opacity-25 rounded-full items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm z-20"
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

    </div>
  );
}
