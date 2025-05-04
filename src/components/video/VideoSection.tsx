"use client";

import React, {
  useReducer,
  useCallback,
  memo,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";
import { VideoUploader } from "./VideoUpload";
import CardInnerWrapper from "../CardInnerWrapper";
import AppModal from "../AppModal";
import { Film, PlayCircle, Calendar, Eye } from "lucide-react";
import { transformImageUrl } from "@/lib/util";
import { optimizeS3VideoUrl } from "@/lib/audio-helpers";
import VideoPlayer from "./VideoPlayer";

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

interface VideoSectionState {
  error: string | null;
  selectedVideo: Video | null;
  selectedVideoUrl: string | null;
  isModalOpen: boolean;
  profileImage: string | null;
}

type VideoSectionAction =
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SELECT_VIDEO"; payload: Video }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_PROFILE_IMAGE"; payload: string }
  | { type: "OPEN_VIDEO_MODAL"; payload: string };

const initialState: VideoSectionState = {
  error: null,
  selectedVideo: null,
  selectedVideoUrl: null,
  isModalOpen: false,
  profileImage: null,
};

const videoSectionReducer = (
  state: VideoSectionState,
  action: VideoSectionAction
): VideoSectionState => {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SELECT_VIDEO":
      return {
        ...state,
        selectedVideo: action.payload,
        isModalOpen: true,
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        isModalOpen: false,
        selectedVideo: null,
      };
    case "SET_PROFILE_IMAGE":
      return { ...state, profileImage: action.payload };
    case "OPEN_VIDEO_MODAL":
      return {
        ...state,
        selectedVideo: null,
        selectedVideoUrl: action.payload,
        isModalOpen: true,
      };
    default:
      return state;
  }
};

// Helper function to format video duration
const formatDuration = (durationInSeconds?: number): string => {
  if (!durationInSeconds) return "00:00";
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Format date for videos
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
};

const VideoCard = memo(
  ({
    video,
    profileImage,
    memberName,
    onClick,
  }: {
    video: Video;
    profileImage: string;
    memberName?: string;
    onClick: (video: Video) => void;
  }) => {
    const formattedDuration = useMemo(() => {
      return formatDuration(video.duration);
    }, [video.duration]);

    const handleVideoClick = () => {
      // Create an optimized version of the video with our audio helper
      const optimizedVideo = {
        ...video,
        url: optimizeS3VideoUrl(video.url),
      };
      onClick(optimizedVideo);
    };

    return (
      <div
        className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={handleVideoClick}
        tabIndex={0}
        role="button"
        aria-label={`צפה בסרטון מ-${formatDate(video.createdAt)}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleVideoClick();
          }
        }}
      >
        <div className="aspect-video overflow-hidden relative">
          <div className="w-full h-full relative">
            <Image
              src={profileImage}
              alt={memberName || "תמונת סרטון"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3 transition-all duration-300 group-hover:scale-110">
              <PlayCircle
                className="text-white w-16 h-16 opacity-90"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formattedDuration}
          </div>
        </div>

        <div className="p-3 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={14} aria-hidden="true" />
              <span>{formatDate(video.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye size={14} aria-hidden="true" />
              <span>צפייה מלאה</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoCard.displayName = "VideoCard";

export const VideoSection: React.FC<VideoSectionProps> = memo(
  ({ videos = [], memberId, isOwnProfile, member, memberPhotos = [] }) => {
    const [state, dispatch] = useReducer(videoSectionReducer, initialState);

    useEffect(() => {
      if (memberPhotos && memberPhotos.length > 0) {
        const photoUrl = memberPhotos[0].url;
        const transformed = transformImageUrl(photoUrl);
        if (transformed) {
          dispatch({ type: "SET_PROFILE_IMAGE", payload: transformed });
        }
      }
    }, [memberPhotos]);

    const handleUploadComplete = useCallback(() => {
      window.location.reload();
    }, []);

    const handleError = useCallback((errorMessage: string) => {
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      setTimeout(() => dispatch({ type: "CLEAR_ERROR" }), 5000);
    }, []);

    const handleVideoClick = useCallback((video: Video) => {
      dispatch({ type: "SELECT_VIDEO", payload: video });
    }, []);

    const handleCloseModal = useCallback(() => {
      dispatch({ type: "CLOSE_MODAL" });
    }, []);

    const renderVideoModal = useCallback(() => {
      if (!state.isModalOpen) return null;

      const videoUrl =
        state.selectedVideoUrl ||
        (state.selectedVideo ? state.selectedVideo.url : null);

      if (!videoUrl) return null;

      const modalBody = (
        <div className="relative aspect-video w-full">
          <VideoPlayer
            videoUrl={videoUrl}
            autoPlay={true}
            controls={true}
            muted={false}
            className="production-video-player"
          />
          <div className="text-white text-center mt-2 text-sm">
            לחץ על הנגן לשמיעת קול
          </div>
        </div>
      );

      return (
        <AppModal
          isOpen={state.isModalOpen}
          onClose={handleCloseModal}
          body={modalBody}
          imageModal={true}
          size="md"
        />
      );
    }, [
      state.isModalOpen,
      state.selectedVideo,
      state.selectedVideoUrl,
      handleCloseModal,
    ]);

    const renderEmptyState = useCallback(
      () => (
        <div
          className="text-center text-gray-500 py-8 border border-gray-200 rounded-lg flex flex-col items-center justify-center"
          role="status"
          aria-label="אין סרטונים זמינים"
        >
          <Film className="h-12 w-12 text-gray-300 mb-2" aria-hidden="true" />
          <p>עדיין לא הועלו סרטוני פרופיל</p>
          {isOwnProfile && (
            <p className="text-sm text-gray-400 mt-1">
              העלה סרטון קצר כדי להציג את עצמך בצורה טובה יותר
            </p>
          )}
        </div>
      ),
      [isOwnProfile]
    );

    const hasVideos = videos.length > 0;

    return (
      <CardInnerWrapper
        header={
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5" aria-hidden="true" />
            <span>סרטוני פרופיל</span>
            {hasVideos && (
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
                {state.error && (
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded animate-pulse"
                    role="alert"
                    aria-live="assertive"
                  >
                    {state.error}
                  </div>
                )}
              </>
            )}

            {hasVideos ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                role="list"
                aria-label="רשימת סרטונים"
              >
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    profileImage={state.profileImage || "/images/user.png"}
                    memberName={member?.name}
                    onClick={handleVideoClick}
                  />
                ))}
              </div>
            ) : (
              renderEmptyState()
            )}

            <AppModal
              isOpen={state.isModalOpen}
              onClose={handleCloseModal}
              body={renderVideoModal()}
              imageModal={true}
              size="2xl"
            />
          </div>
        }
      />
    );
  }
);

VideoSection.displayName = "VideoSection";
