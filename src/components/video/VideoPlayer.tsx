"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  preview?: boolean;
  thumbnailUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  className = "",
  preview = false,
  thumbnailUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [duration, setDuration] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const tryPlayVideo = useCallback(() => {
    if (videoRef.current) {
      if (preview) {
        videoRef.current.muted = true;
      }

      videoRef.current.play().catch((err) => {
        console.warn("Video play failed:", err);
      });
    }
  }, [videoRef, preview]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      const videoElement = videoRef.current;

      const handleError = () => {
        console.error("Video error loading:", url);
        setError("Failed to load video");
        setIsLoading(false);
      };

      const handleLoadedData = () => {
        setIsLoading(false);
        setError(null);
        setDuration(videoElement.duration);

        // Save the actual video dimensions when loaded
        setVideoWidth(videoElement.videoWidth);
        setVideoHeight(videoElement.videoHeight);

        if ((autoPlay || preview) && videoElement) {
          tryPlayVideo();
        }
      };

      videoElement.addEventListener("error", handleError);
      videoElement.addEventListener("loadeddata", handleLoadedData);

      return () => {
        videoElement.removeEventListener("error", handleError);
        videoElement.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, [url, autoPlay, preview, tryPlayVideo]);

  // Center the video content when dimensions change
  useEffect(() => {
    if (videoWidth && videoHeight && containerRef.current && videoRef.current) {
      if (preview) {
        // For preview mode, let's use object-fit: contain
        videoRef.current.style.objectFit = "contain";
      }
    }
  }, [videoWidth, videoHeight, preview]);

  useEffect(() => {
    if (preview && !isLoading && !error) {
      tryPlayVideo();
    }
  }, [preview, isLoading, error, tryPlayVideo]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setShowThumbnail(false);
    if (!preview && videoRef.current) {
      tryPlayVideo();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowThumbnail(true);
    if (!preview && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 rounded-lg">
          <div className="text-red-600 text-sm px-4 py-2 bg-white rounded shadow">
            {error}
            <div className="text-xs mt-1 text-gray-500">URL: {url}</div>
          </div>
        </div>
      )}

      {showThumbnail && thumbnailUrl && !isLoading && !error && (
        <div className="absolute inset-0">
          <Image
            src={thumbnailUrl}
            alt="תמונת ממוזערת"
            className="w-full h-full object-cover rounded-lg"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className={`max-w-full max-h-full rounded-lg ${
          preview ? "object-contain" : "object-contain"
        }`}
        controls={preview ? false : controls || isHovering}
        autoPlay={autoPlay}
        loop={loop || preview}
        muted={muted || preview}
        playsInline
        preload="metadata"
        style={{ margin: "auto" }}
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/quicktime" />
        <source src={url} type="video/x-msvideo" />
        הדפדפן שלך אינו תומך בתג וידאו.
      </video>

      {isHovering && !error && !isLoading && !preview && (
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
