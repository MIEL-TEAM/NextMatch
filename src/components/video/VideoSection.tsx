"use client";

import React, { useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoUploader } from "./VideoUpload";
import CardInnerWrapper from "../CardInnerWrapper";

interface Video {
  id: string;
  url: string;
  createdAt: string;
  memberId: string;
  duration: number;
  isApproved: boolean;
}

interface VideoSectionProps {
  videos: Video[];
  memberId: string;
  userId: string;
  isOwnProfile: boolean;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videos = [],
  memberId,
  isOwnProfile,
}) => {
  const [error, setError] = useState("");

  const handleUploadComplete = () => {
    window.location.reload();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  };

  return (
    <CardInnerWrapper
      header="Videos"
      body={
        <div className="flex flex-col gap-4 p-4">
          {isOwnProfile && (
            <>
              <VideoUploader
                memberId={memberId}
                onUploadComplete={handleUploadComplete}
                onError={handleError}
              />
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos?.map((video) => (
              <div
                key={video.id}
                className="border border-gray-200 rounded-lg p-2"
              >
                <p className="text-xs text-gray-500 mb-1">
                  Video ID: {video.id.substring(0, 8)}...
                </p>
                <VideoPlayer
                  key={video.id}
                  url={video.url}
                  controls
                  className="aspect-video"
                />
              </div>
            ))}
          </div>

          {(!videos || videos.length === 0) && (
            <div className="text-center text-gray-500 py-4">
              עדיין לא הועלו סרטוני פרופיל
            </div>
          )}
        </div>
      }
    />
  );
};
