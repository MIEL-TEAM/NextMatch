"use client";

import React, { useReducer, useRef, useEffect, useCallback } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { transformImageUrl } from "@/lib/util";
import ReactPlayer from "react-player";
import {
  initializeAudio,
  isAudioLikelyBlocked,
  optimizeS3VideoUrl,
  detectUserInteraction,
} from "@/lib/audio-helpers";

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

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isHovering: boolean;
  isReady: boolean;
  hasInteracted: boolean;
}

type VideoPlayerAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TOGGLE_PLAY" }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_HOVERING"; payload: boolean }
  | { type: "SET_READY"; payload: boolean }
  | { type: "SET_INTERACTED"; payload: boolean };

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
    case "SET_INTERACTED":
      return { ...state, hasInteracted: action.payload };
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
  const [state, dispatch] = useReducer(videoPlayerReducer, {
    isPlaying: autoPlay,
    isMuted: initialMuted,
    isHovering: false,
    isReady: false,
    hasInteracted: false,
  });

  const playerRef = useRef<ReactPlayer>(null);
  const unmountedRef = useRef(false);

  // Track user interaction to enable audio later
  useEffect(() => {
    // Use the new audio helper for interaction detection
    return detectUserInteraction(() => {
      if (!state.hasInteracted && !unmountedRef.current) {
        dispatch({ type: "SET_INTERACTED", payload: true });
      }
    });
  }, [state.hasInteracted]);

  // Handle autoplay
  useEffect(() => {
    if (autoPlay && playerRef.current) {
      dispatch({ type: "PLAY" });
    }

    return () => {
      if (state.isPlaying) {
        dispatch({ type: "PAUSE" });
      }
    };
  }, [autoPlay, state.isPlaying]);

  useEffect(() => {
    if (playerRef.current && state.hasInteracted && !initialMuted) {
      const internalPlayer = playerRef.current.getInternalPlayer();
      if (internalPlayer) {
        try {
          internalPlayer.muted = false;
          internalPlayer.volume = 1.0;
        } catch (e) {
          console.warn("Could not unmute video:", e);
        }
      }
    }
  }, [state.hasInteracted, initialMuted]);

  const handlePlay = useCallback(() => {
    dispatch({ type: "PLAY" });
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    dispatch({ type: "PAUSE" });
    onPause?.();
  }, [onPause]);

  // Get internal player (enhanced with better error handling for production)
  const getInternalPlayer = useCallback(() => {
    try {
      return playerRef.current?.getInternalPlayer() as HTMLVideoElement | null;
    } catch (e) {
      console.warn("Could not access internal player:", e);
      return null;
    }
  }, []);

  // Enhanced for production - explicitly set playback properties
  useEffect(() => {
    // Try to set audio properties directly when player becomes ready
    if (state.isReady && state.hasInteracted && !state.isMuted) {
      const internalPlayer = getInternalPlayer();
      if (internalPlayer) {
        try {
          // Use the new initializeAudio helper
          initializeAudio(internalPlayer).catch((e) => {
            console.warn("Audio initialization failed:", e);
          });
        } catch (e) {
          console.warn("Failed to prepare audio in production:", e);
        }
      }
    }
  }, [state.isReady, state.hasInteracted, state.isMuted, getInternalPlayer]);

  const togglePlay = useCallback(() => {
    if (!state.isReady) return;

    dispatch({ type: "TOGGLE_PLAY" });
    dispatch({ type: "SET_INTERACTED", payload: true });

    const internalPlayer = getInternalPlayer();
    if (!internalPlayer) return;

    if (!state.isPlaying) {
      try {
        const playPromise = internalPlayer.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (!state.isMuted && state.hasInteracted && internalPlayer) {
                internalPlayer.muted = false;
                internalPlayer.volume = 1.0;
              }
            })
            .catch(() => {
              // Autoplay was prevented, try muted playback
              if (internalPlayer) {
                internalPlayer.muted = true;
                internalPlayer.play().catch((e) => {
                  console.error("Failed to play video:", e);
                });
              }
            });
        }
        onPlay?.();
      } catch (error) {
        console.error("Error playing video:", error);
      }
    } else {
      try {
        if (!internalPlayer.paused) {
          internalPlayer.pause();
        }
        onPause?.();
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
  }, [
    state.isReady,
    state.isPlaying,
    state.isMuted,
    state.hasInteracted,
    getInternalPlayer,
    onPlay,
    onPause,
  ]);

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({ type: "TOGGLE_MUTE" });
      dispatch({ type: "SET_INTERACTED", payload: true });

      const internalPlayer = getInternalPlayer();
      if (internalPlayer) {
        try {
          internalPlayer.muted = !state.isMuted;
          if (!state.isMuted) {
            internalPlayer.volume = 1.0;
          }
        } catch (error) {
          console.error("Error toggling mute:", error);
        }
      }
    },
    [state.isMuted, getInternalPlayer]
  );

  // Get poster URL for video if available
  const posterUrl = thumbnailUrl ? transformImageUrl(thumbnailUrl) : undefined;

  // Optimize S3 URL for audio compatibility
  const optimizedVideoUrl = optimizeS3VideoUrl(videoUrl);

  // Detect if audio might be blocked
  const audioMightBeBlocked = isAudioLikelyBlocked();

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
            url={optimizedVideoUrl}
            playing={state.isPlaying}
            loop={loop}
            muted={state.isMuted}
            width="100%"
            height="100%"
            playsinline
            onPlay={handlePlay}
            onPause={handlePause}
            onReady={() => {
              dispatch({ type: "SET_READY", payload: true });
              // Attempt to initialize audio on ready for production
              if (state.hasInteracted && !state.isMuted) {
                const player = getInternalPlayer();
                if (player) {
                  try {
                    player.muted = false;
                    player.volume = 1.0;
                  } catch (e) {
                    console.warn("Could not initialize audio:", e);
                  }
                }
              }
            }}
            onError={(e) => console.error("Video error:", e)}
            config={{
              file: {
                attributes: {
                  poster: posterUrl,
                  preload: "auto", // Changed from metadata to auto for production
                  crossOrigin: "anonymous",
                  className: "w-full h-full object-cover",
                },
                forceVideo: true,
                forceAudio: true, // Force audio initialization for production
                hlsOptions: {
                  // Add HLS options for better streaming from S3
                  enableWorker: true,
                  autoStartLoad: true,
                  startLevel: 0,
                  // Enhanced S3 streaming configs
                  maxBufferLength: 30,
                  maxMaxBufferLength: 60,
                  fragLoadingMaxRetry: 5,
                  fragLoadingRetryDelay: 1000,
                  manifestLoadingMaxRetry: 4,
                  manifestLoadingRetryDelay: 500,
                  xhrSetup: (xhr: XMLHttpRequest) => {
                    // Add CORS headers for S3 compatibility
                    xhr.withCredentials = false;
                  },
                },
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
          aria-hidden={state.isPlaying && !state.isHovering}
        >
          {!state.isPlaying && (
            <button
              className="h-14 w-14 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
              onClick={togglePlay}
              type="button"
              aria-label="הפעל וידאו ושמע"
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

        {/* Add a production audio notice based on audio might be blocked check */}
        {(!state.hasInteracted || audioMightBeBlocked) && (
          <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-xs text-center py-1">
            לחץ כאן להפעלת סאונד
          </div>
        )}
      </div>
    </div>
  );
}
