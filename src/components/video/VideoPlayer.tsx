"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import VideoControls from "./VideoControls";
import VideoThumbnail from "./VideoThumbnail";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  preview?: boolean;
  thumbnailUrl?: string;
  light?: boolean;
  pip?: boolean;
  aspectRatio?: "square" | "video" | string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = true,
  className = "",
  preview = false,
  thumbnailUrl,
  light = false,
  pip = false,
  aspectRatio = "video",
  onReady,
  onError,
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(muted);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(controls);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasUserInteracted = useRef<boolean>(false);

  // Aspect ratio style
  const aspectRatioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
        ? "aspect-video"
        : "";

  // Handle autoplay with muted state
  const safePlay = useCallback((): void => {
    setPlaying(true);
    // If we need to play and are not ready for unmuted, stay muted
    if (!hasUserInteracted.current) {
      setIsMuted(true);
    }
  }, []);

  // Handle ready state
  const handleReady = useCallback((): void => {
    setIsReady(true);
    setError(null);

    // Get duration if available
    if (playerRef.current) {
      try {
        const playerDuration = playerRef.current.getDuration();
        if (
          !isNaN(playerDuration) &&
          isFinite(playerDuration) &&
          playerDuration > 0
        ) {
          setDuration(playerDuration);
        }
      } catch (e) {
        console.log(e);
      }
    }

    // Autoplay if requested
    if (autoPlay) {
      safePlay();
    }

    if (onReady) onReady();
  }, [autoPlay, onReady, safePlay]);

  // Handle errors
  const handleError = useCallback(
    (error: any): void => {
      setError("Failed to load video");
      setIsReady(true); // Mark as ready to remove loading indicator

      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  // Toggle play/pause
  const togglePlay = useCallback((e?: React.MouseEvent): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setPlaying((prevPlaying) => !prevPlaying);
    hasUserInteracted.current = true;
  }, []);

  // Handle video click
  const handleVideoClick = useCallback(
    (e: React.MouseEvent): void => {
      if (controls) togglePlay(e);
    },
    [controls, togglePlay]
  );

  // Toggle mute
  const toggleMute = useCallback((e?: React.MouseEvent): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    hasUserInteracted.current = true;
    setIsMuted((prevMuted) => !prevMuted);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((error) => {
          console.log(error);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  // Update fullscreen state
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Control visibility
  const handleMouseEnter = useCallback((): void => {
    if (controls) setShowControls(true);
  }, [controls]);

  const handleMouseLeave = useCallback((): void => {
    if (controls && !preview && !playing) setShowControls(false);
  }, [controls, preview, playing]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${aspectRatioClass} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleVideoClick}
    >
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 rounded-lg z-50">
          <div className="text-red-600 text-sm px-4 py-2 bg-white rounded shadow">
            {error}
            <div className="text-xs mt-1 text-gray-500 truncate max-w-xs">
              URL: {url}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-40">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Thumbnail or video player */}
      {light && !playing ? (
        <VideoThumbnail
          thumbnailUrl={thumbnailUrl}
          onPlayClick={() => {
            hasUserInteracted.current = true;
            safePlay();
          }}
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          controls={false}
          loop={loop || preview}
          muted={isMuted}
          volume={1}
          pip={pip}
          onReady={handleReady}
          onError={handleError}
          playsinline
          config={{
            file: {
              attributes: {
                preload: "auto",
                controlsList: "nodownload",
                disablePictureInPicture: !pip,
                style: { objectFit: "cover" },
              },
              forceVideo: true,
            },
            youtube: {
              playerVars: {
                modestbranding: 1,
                playsinline: 1,
                controls: 0,
                showinfo: 0,
                rel: 0,
                iv_load_policy: 3,
              },
            },
          }}
          style={{
            objectFit: "cover",
            backgroundColor: "#000",
          }}
        />
      )}

      {/* Custom controls */}
      {showControls && !preview && !error && (
        <VideoControls
          playing={playing}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          duration={duration}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
