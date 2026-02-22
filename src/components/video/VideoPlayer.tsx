"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  aspectRatio?: "square" | "video" | string;
  className?: string;
  showControls?: boolean;
  showMuteControl?: boolean;
  onError?: (error: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  loop = false,
  muted = true,
  aspectRatio = "video",
  className = "",
  showControls = true,
  showMuteControl = false,
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
        videoRef.current.play().catch(() => { });
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

      {/* Full controls — play + mute */}
      {showControls && (
        <div className="absolute bottom-2 left-2 flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="bg-black/50 text-white p-2 rounded hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="bg-black/50 text-white p-2 rounded hover:bg-black/70 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      )}

      {/* Mute-only control — for card contexts */}
      {!showControls && showMuteControl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute bottom-3 left-3 z-10 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;