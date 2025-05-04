"use client";

import React, { useState, useCallback } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoUploader } from "@/components/video/VideoUpload";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import AppModal from "@/components/AppModal";
import { PlayCircle } from "lucide-react";

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
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadComplete = () => {
    window.location.reload();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  };

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(date);
  };

  const renderVideoModal = () => {
    if (!selectedVideo) return null;

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative aspect-video w-full max-w-3xl mx-auto">
          <VideoPlayer
            url={selectedVideo.url}
            controls={true}
            autoPlay={true}
            className="w-auto h-auto max-w-full max-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    );
  };

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

          {videos.length > 0 && (
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

                  <div className="relative aspect-video overflow-hidden rounded flex items-center justify-center bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoPlayer
                        key={video.id}
                        url={video.url}
                        controls={false}
                        muted={true}
                        className="w-auto h-auto max-w-full max-h-full"
                      />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 z-10">
                      <PlayCircle className="text-white w-12 h-12 opacity-80 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!videos || videos.length === 0) && (
            <div className="text-center text-gray-500 py-4 border border-gray-200 rounded-lg">
              עדיין לא הועלו סרטוני פרופיל
            </div>
          )}

          <AppModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            body={renderVideoModal()}
            imageModal={true}
            size="2xl"
          />
        </div>
      }
    />
  );
};
