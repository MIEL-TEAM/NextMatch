"use client";

import React from "react";
import VideoPlayer from "@/components/video/VideoPlayer";

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
  // If there's a video but no children, show the video player
  if (singleVideoUrl && !children) {
    return (
      <div className="w-full">
        <VideoPlayer
          videoUrl={singleVideoUrl}
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

  // If there are children (such as upload controls), render them
  if (children) {
    return (
      <div className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        {children}
      </div>
    );
  }

  // If there's no video and no children, don't render anything
  return null;
}
