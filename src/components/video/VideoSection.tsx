"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import Image from "next/image";
import { VideoUploader } from "./VideoUpload";
import CardInnerWrapper from "../CardInnerWrapper";
import AppModal from "../AppModal";
import {
  Film,
  PlayCircle,
  Calendar,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import { transformImageUrl } from "@/lib/util";

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
  member?: {
    name: string;
    userId: string;
    profileImageUrl: string | undefined;
  };
  memberPhotos?: Array<{ url: string; id: string }>;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videos = [],
  memberId,
  isOwnProfile,
  member,
  memberPhotos = [],
}) => {
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/images/user.png");
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<ReactPlayer>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (memberPhotos && memberPhotos.length > 0) {
      const photoUrl = memberPhotos[0].url;
      const transformed = transformImageUrl(photoUrl);
      if (transformed) {
        setProfileImage(transformed);
      }
    }
  }, [memberPhotos]);

  const handleUploadComplete = () => {
    window.location.reload();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 5000);
  };

  const handleVideoClick = useCallback((video: Video) => {
    setError("");
    setSelectedVideo(video);
    setIsModalOpen(true);
    setIsMuted(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsMuted(true);

    // Clean up audio resources
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
        isConnectedRef.current = false;
      } catch (e) {
        console.error("Error cleaning up audio resources:", e);
      }
    }
  }, []);

  const setupAudioConnection = useCallback(() => {
    if (isConnectedRef.current) return;

    if (!playerRef.current) return;

    const internalPlayer =
      playerRef.current.getInternalPlayer() as HTMLVideoElement;
    if (!internalPlayer || internalPlayer.muted) return;

    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }

        sourceNodeRef.current =
          audioContextRef.current.createMediaElementSource(internalPlayer);
        sourceNodeRef.current.connect(audioContextRef.current.destination);
        isConnectedRef.current = true;
      }
    } catch (e) {
      console.error("Error setting up audio connection:", e);
    }
  }, []);

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setIsMuted((prevMuted) => {
        const newMutedState = !prevMuted;

        // If unmuting, set up audio connection
        if (!newMutedState) {
          setupAudioConnection();
        }

        return newMutedState;
      });
    },
    [setupAudioConnection]
  );

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
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="relative aspect-video w-full max-w-4xl">
          <ReactPlayer
            ref={playerRef}
            key={`player-${selectedVideo.id}-${isMuted ? "muted" : "unmuted"}`}
            url={selectedVideo.url}
            width="100%"
            height="100%"
            playing={true}
            controls={true}
            muted={isMuted}
            volume={1.0}
            playsinline
            onReady={() => {
              // Ensure volume is set properly after player is ready
              if (!isMuted) {
                setupAudioConnection();
              }
            }}
            onError={() => {
              setError("Failed to load video. Please try again later.");
            }}
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
                  disablePictureInPicture: true,
                  playsInline: true,
                  crossOrigin: "anonymous",
                  preload: "auto",
                },
                forceAudio: true,
                forceVideo: true,
                // Add HLS support for better streaming
                hlsOptions: {
                  enableWorker: true,
                  startLevel: 0,
                  autoStartLoad: true,
                  liveDurationInfinity: false,
                },
              },
            }}
          />

          {/* Sound toggle button */}
          <button
            onClick={toggleMute}
            className="absolute bottom-16 right-4 z-50 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
            aria-label={isMuted ? "הפעל שמע" : "השתק"}
            type="button"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Error display */}
          {error && (
            <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-2 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <CardInnerWrapper
      header={
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          <span>סרטוני פרופיל</span>
          {videos.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 ml-2 text-xs font-medium leading-none text-white bg-blue-500 rounded-full">
              {videos.length}
            </span>
          )}
        </div>
      }
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
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded animate-pulse">
                  {error}
                </div>
              )}
            </>
          )}

          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="aspect-video overflow-hidden relative">
                    <div className="w-full h-full relative">
                      <Image
                        src={profileImage}
                        alt={member?.name || "Video thumbnail"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3 transition-all duration-300 group-hover:scale-110">
                        <PlayCircle className="text-white w-16 h-16 opacity-90" />
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration
                        ? `${Math.floor(video.duration / 60)}:${String(
                            Math.floor(video.duration % 60)
                          ).padStart(2, "0")}`
                        : "00:17"}
                    </div>
                  </div>

                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(video.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye size={14} />
                        <span>צפייה מלאה</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!videos || videos.length === 0) && (
            <div className="text-center text-gray-500 py-8 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <Film className="h-12 w-12 text-gray-300 mb-2" />
              <p>עדיין לא הועלו סרטוני פרופיל</p>
              {isOwnProfile && (
                <p className="text-sm text-gray-400 mt-1">
                  העלה סרטון קצר כדי להציג את עצמך בצורה טובה יותר
                </p>
              )}
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
