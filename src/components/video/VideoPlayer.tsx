"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { transformImageUrl } from "@/lib/util";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  autoPlay = false,
  loop = true,
  controls = true,
  muted: initialMuted = true,
  className = "",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Declare pauseVideo first since attemptPlayback depends on it
  const pauseVideo = useCallback(() => {
    if (!videoRef.current) return;

    if (!videoRef.current.paused) {
      videoRef.current.pause();
    }

    setIsPlaying(false);
    playPromiseRef.current = null;
  }, []);

  // Define attemptPlayback as a callback to use in useEffect
  const attemptPlayback = useCallback(() => {
    if (!videoRef.current) return;

    // Cancel any pending play operations
    if (playPromiseRef.current) {
      pauseVideo();
    }

    // Reload video for better compatibility especially on iOS
    videoRef.current.load();

    // Start new play operation
    playPromiseRef.current = videoRef.current.play();
    playPromiseRef.current
      .then(() => {
        setIsPlaying(true);
      })
      .catch((err) => {
        console.error("Video play error:", err.message);
        setIsPlaying(false);
        playPromiseRef.current = null;
      });
  }, [pauseVideo]);

  // Initial setup and autoplay handling
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      attemptPlayback();
    }

    return () => {
      // Clean up when component unmounts
      pauseVideo();
    };
  }, [autoPlay, videoUrl, attemptPlayback, pauseVideo]);

  // Update mute state when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;

      // For iOS, fully reload video when mute state changes
      if (videoRef.current.paused && isPlaying) {
        attemptPlayback();
      }
    }
  }, [isMuted, isPlaying, attemptPlayback]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      attemptPlayback();
    } else {
      pauseVideo();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // Helper function to combine class names conditionally
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // Get poster URL for video if available
  const thumbnailTransformed = thumbnailUrl
    ? transformImageUrl(thumbnailUrl)
    : null;
  const posterUrl = thumbnailTransformed || undefined;

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer"
        onClick={togglePlay}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={videoUrl}
          poster={posterUrl}
          muted={isMuted}
          loop={loop}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          controls={controls && isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
            isPlaying && !isHovering ? "opacity-0" : "opacity-100"
          )}
        >
          {!isPlaying && (
            <button
              className="h-14 w-14 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
              onClick={togglePlay}
              type="button"
            >
              <Play className="h-6 w-6 text-white fill-white" />
            </button>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
          aria-label={isMuted ? "הפעל שמע" : "השתק"}
          type="button"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
