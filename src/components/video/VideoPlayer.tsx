// EnhancedVideoPlayerWithReactPlayer.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  preview?: boolean;
  thumbnailUrl?: string;
  onError?: (message: string) => void;
}

export const EnhancedVideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  className = "",
  preview = false,
  thumbnailUrl,
  onError,
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(controls);
  const [bufferedPercentage, setBufferedPercentage] = useState(0);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
    if (!preview) {
      setShowThumbnail(false);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const handleMouseLeave = () => {
    if (!controls) {
      setShowControls(false);
    }
    if (!preview) {
      setShowThumbnail(true);
      if (!autoPlay) {
        setIsPlaying(false);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      playerRef.current.seekTo(position * duration, "seconds");
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReady = () => {
    setIsLoading(false);
    if (playerRef.current) {
      setDuration(playerRef.current.getDuration());
    }
  };

  const handleError = () => {
    setError("Failed to load video");
    setIsLoading(false);
    if (onError) onError("Failed to load video");
  };

  const handleProgress = (state: {
    played: number;
    loaded: number;
    playedSeconds: number;
  }) => {
    setCurrentTime(state.playedSeconds);
    setBufferedPercentage(state.loaded * 100);
  };

  useEffect(() => {
    if (preview && !isLoading && !error) {
      setIsPlaying(true);
    }
  }, [preview, isLoading, error]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${className} rounded-lg overflow-hidden`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 rounded-lg z-20">
          <div className="text-red-600 text-sm px-4 py-2 bg-white rounded shadow">
            {error}
            <div className="text-xs mt-1 text-gray-500">URL: {url}</div>
          </div>
        </div>
      )}

      {showThumbnail && thumbnailUrl && !isLoading && !error && (
        <div className="absolute inset-0 z-10">
          <Image
            src={thumbnailUrl}
            alt="תמונת ממוזערת"
            className="w-full h-full object-cover rounded-lg"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 transition-all duration-200"
              onClick={togglePlay}
              aria-label="נגן וידאו"
            >
              <Play className="w-8 h-8 text-white" fill="white" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`w-full h-full ${
          showThumbnail ? "opacity-0" : "opacity-100"
        }`}
      >
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={isPlaying}
          controls={false}
          loop={loop || preview}
          muted={isMuted || preview}
          playsinline
          width="100%"
          height="100%"
          style={{ objectFit: preview ? "contain" : "contain" }}
          onReady={handleReady}
          onError={handleError}
          onProgress={handleProgress}
          onPlay={handlePlay}
          onPause={handlePause}
          onClick={togglePlay}
          config={{
            file: {
              attributes: {
                preload: "metadata",
              },
            },
          }}
        />
      </div>

      {showControls && !error && !isLoading && !preview && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white z-20 transition-opacity duration-300">
          <div
            ref={progressRef}
            className="h-2 w-full bg-gray-600 rounded-full mb-2 cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gray-400 z-10"
              style={{ width: `${bufferedPercentage}%` }}
            ></div>

            <div
              className="absolute top-0 left-0 h-full bg-blue-500 z-20"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                onClick={togglePlay}
                aria-label={isPlaying ? "השהה" : "נגן"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" fill="white" />
                )}
              </button>

              <button
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                onClick={toggleMute}
                aria-label={isMuted ? "הפעל שמע" : "השתק"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-xs mx-2">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                onClick={handleFullscreen}
                aria-label="מסך מלא"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs">
          <div className="flex justify-between items-center">
            <span>תצוגה מקדימה</span>
            {duration > 0 && <span>{formatDuration(duration)}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoPlayer;
