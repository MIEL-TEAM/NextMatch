"use client";

import React, { useCallback, memo } from "react";
import { Play, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

interface VideoControlsProps {
  playing: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  duration: number | null;
  togglePlay: (e: React.MouseEvent) => void;
  toggleMute: (e: React.MouseEvent) => void;
  toggleFullscreen: (e: React.MouseEvent) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  playing,
  isMuted,
  isFullscreen,
  duration,
  togglePlay,
  toggleMute,
  toggleFullscreen,
}) => {
  // Format duration for display
  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null || isNaN(seconds) || !isFinite(seconds))
      return "--:--";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Prevent click propagation to parent
  const handleControlsClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-center justify-between gap-2 transition-opacity duration-200"
      onClick={handleControlsClick}
    >
      <button
        onClick={togglePlay}
        className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <Play className="w-5 h-5" fill="white" />
        )}
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {document.fullscreenEnabled && (
          <button
            onClick={toggleFullscreen}
            className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        )}

        {duration && (
          <span className="text-white text-xs">{formatTime(duration)}</span>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(VideoControls);