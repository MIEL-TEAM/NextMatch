"use client";

import React, { useReducer, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { transformImageUrl } from "@/lib/util";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

// Define the state interface
interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isHovering: boolean;
  isReady: boolean;
}

// Define action types and action interface
type VideoPlayerAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TOGGLE_PLAY" }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_HOVERING"; payload: boolean }
  | { type: "SET_READY"; payload: boolean };

// Reducer function
const videoPlayerReducer = (
  state: VideoPlayerState,
  action: VideoPlayerAction
): VideoPlayerState => {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };
    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted };
    case "SET_HOVERING":
      return { ...state, isHovering: action.payload };
    case "SET_READY":
      return { ...state, isReady: action.payload };
    default:
      return state;
  }
};

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  autoPlay = false,
  loop = true,
  controls = true,
  muted: initialMuted = true,
  className = "",
  onPlay,
  onPause,
}: VideoPlayerProps) {
  // Initialize the reducer with default state
  const [state, dispatch] = useReducer(videoPlayerReducer, {
    isPlaying: autoPlay,
    isMuted: initialMuted,
    isHovering: false,
    isReady: false,
  });

  const playerRef = useRef<ReactPlayer>(null);

  // Handle autoplay when component mounts
  useEffect(() => {
    if (autoPlay && playerRef.current) {
      dispatch({ type: "PLAY" });
    }

    // Cleanup on unmount
    return () => {
      if (state.isPlaying) {
        dispatch({ type: "PAUSE" });
      }
    };
  }, [autoPlay, state.isPlaying]);

  // Handle play event
  const handlePlay = () => {
    dispatch({ type: "PLAY" });
    onPlay?.();
  };

  // Handle pause event
  const handlePause = () => {
    dispatch({ type: "PAUSE" });
    onPause?.();
  };

  // Handle toggle play
  const togglePlay = () => {
    if (!state.isReady) return;

    dispatch({ type: "TOGGLE_PLAY" });
    if (!state.isPlaying) {
      playerRef.current?.getInternalPlayer()?.play();
      onPlay?.();
    } else {
      playerRef.current?.getInternalPlayer()?.pause();
      onPause?.();
    }
  };

  // Handle toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "TOGGLE_MUTE" });
  };

  // Get poster URL for video if available
  const posterUrl = thumbnailUrl ? transformImageUrl(thumbnailUrl) : undefined;

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer"
        onClick={togglePlay}
        onMouseEnter={() => dispatch({ type: "SET_HOVERING", payload: true })}
        onMouseLeave={() => dispatch({ type: "SET_HOVERING", payload: false })}
      >
        <div className="absolute inset-0 w-full h-full">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={state.isPlaying}
            loop={loop}
            muted={state.isMuted}
            width="100%"
            height="100%"
            playsinline
            onPlay={handlePlay}
            onPause={handlePause}
            onReady={() => dispatch({ type: "SET_READY", payload: true })}
            onError={(e) => console.error("Video play error:", e)}
            config={{
              file: {
                attributes: {
                  poster: posterUrl,
                  preload: "auto",
                  crossOrigin: "anonymous",
                  className: "w-full h-full object-cover",
                },
                forceVideo: true,
              },
            }}
            style={{ objectFit: "cover" }}
            controls={controls && state.isPlaying}
          />
        </div>

        <div
          className={`absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${
            state.isPlaying && !state.isHovering ? "opacity-0" : "opacity-100"
          }`}
        >
          {!state.isPlaying && (
            <button
              className="h-14 w-14 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
              onClick={togglePlay}
              type="button"
            >
              <Play className="h-6 w-6 text-white fill-white" />
            </button>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
          aria-label={state.isMuted ? "הפעל שמע" : "השתק"}
          type="button"
        >
          {state.isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
