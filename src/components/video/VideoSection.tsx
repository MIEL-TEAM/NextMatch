"use client";

import React, { useState, useCallback, memo } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoUploader } from "./VideoUpload";
import CardInnerWrapper from "../CardInnerWrapper";
import { PlayCircle } from "lucide-react";
import AppModal from "@/components/AppModal";

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
  const [error, setError] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);

  // Handle upload completion
  const handleUploadComplete = useCallback((): void => {
    window.location.reload();
  }, []);

  // Handle error display with auto-clear
  const handleError = useCallback((errorMessage: string): void => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  }, []);

  // Handle video selection
  const handleVideoClick = useCallback((video: Video): void => {
    setSelectedVideo(video);
    setIsModalOpen(true);
    setUserInteracted(true); // User has interacted by clicking
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
  }, []);

  // Handle video player ready event
  const handleVideoReady = useCallback((): void => {
    if (userInteracted) {
    }
  }, [userInteracted]);

  return (
    <CardInnerWrapper
      header="סרטוני פרופיל"
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

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="relative group border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <p className="text-xs text-gray-500 mb-1 dir-rtl">
                    {formatDate(video.createdAt)}
                  </p>

                  <div className="relative aspect-video overflow-hidden rounded">
                    {/* Use light mode with a play overlay to avoid autoplay issues */}
                    <VideoPlayer
                      key={video.id}
                      url={video.url}
                      controls={false}
                      muted={true}
                      autoPlay={false}
                      light={true}
                      preview={true}
                      className="w-full h-full"
                      aspectRatio="video"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 z-10">
                      <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 border border-gray-200 rounded-lg">
              עדיין לא הועלו סרטוני פרופיל
            </div>
          )}

          <AppModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            body={
              selectedVideo && (
                <div className="flex items-center justify-center w-full h-full p-4">
                  <div className="w-full max-w-md" style={{ aspectRatio: 'auto' }}>
                    <video
                      src={selectedVideo.url}
                      controls
                      autoPlay
                      muted={false}
                      style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '12px' }}
                      onLoadedMetadata={handleVideoReady}
                    />
                  </div>
                </div>
              )
            }
            imageModal={true}
            size="full"
          />


        </div>
      }
    />
  );
};

export default memo(VideoSection);