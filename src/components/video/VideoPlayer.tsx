"use client";

import React, { useRef, useState, useEffect } from "react";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: "square" | "video" | string;
  className?: string;
  onError?: (error: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  loop = false,
  muted = true,
  aspectRatio = "video",
  className = "",
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(muted);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const aspectRatioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
        ? "aspect-video"
        : "";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (autoPlay) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl ${aspectRatioClass} ${className}`}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        controls={false}
        onError={onError}
      />

      <div className="absolute bottom-2 left-2 flex gap-2 z-10">
        <button
          onClick={togglePlay}
          className="bg-black/50 text-white px-2 py-1 rounded"
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <button
          onClick={toggleMute}
          className="bg-black/50 text-white px-2 py-1 rounded"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
