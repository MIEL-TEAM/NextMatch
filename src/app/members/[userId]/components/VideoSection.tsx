"use client";

import React from "react";
import VideoPlayer from "@/components/video/VideoPlayer";
import { optimizeS3VideoUrl } from "@/lib/audio-helpers";

interface VideoSectionProps {
  singleVideoUrl?: string | null;
  thumbnailUrl?: string | null;
  children?: React.ReactNode;
}

export default function VideoSectionForProfile({
  singleVideoUrl,
  thumbnailUrl,
  children,
}: VideoSectionProps) {
  // Optimize the video URL for better audio support if it exists
  const optimizedVideoUrl = singleVideoUrl
    ? optimizeS3VideoUrl(singleVideoUrl)
    : null;

  if (optimizedVideoUrl && !children) {
    return (
      <div className="w-full">
        <VideoPlayer
          videoUrl={optimizedVideoUrl}
          thumbnailUrl={thumbnailUrl}
          autoPlay={false}
          controls={true}
          loop={true}
          muted={false}
          className="w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        />
      </div>
    );
  }

  if (children) {
    return (
      <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        {children}
      </div>
    );
  }

  return null;
}
