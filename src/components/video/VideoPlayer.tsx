"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { transformImageUrl } from "@/lib/util";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  autoPlay = false,
  loop = true,
  controls = true,
  muted: initialMuted = true,
  className = "",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioConnectedRef = useRef<boolean>(false);

  // Initial setup logging
  useEffect(() => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Component mounted");
    console.log("[AUDIO-DEBUG] VideoPlayer - Video URL:", videoUrl);
    console.log("[AUDIO-DEBUG] VideoPlayer - Initial settings:", {
      autoPlay,
      loop,
      muted: initialMuted,
    });

    return () => {
      console.log("[AUDIO-DEBUG] VideoPlayer - Component unmounted");
    };
  }, [videoUrl, autoPlay, loop, initialMuted]);

  // Auto play if specified
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      console.log("[AUDIO-DEBUG] VideoPlayer - Attempting autoplay");
      videoRef.current
        .play()
        .then(() => {
          console.log("[AUDIO-DEBUG] VideoPlayer - Autoplay successful");
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("[AUDIO-DEBUG] VideoPlayer - Autoplay failed:", err);
          setIsPlaying(false);
        });
    }
  }, [autoPlay]);

  // Update mute state when changed
  useEffect(() => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Mute state changed:", isMuted);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      console.log("[AUDIO-DEBUG] VideoPlayer - Set video.muted to:", isMuted);
    }
  }, [isMuted]);

  // Setup audio context when unmuting for the first time
  const setupAudioContext = () => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Setting up AudioContext");
    console.log(
      "[AUDIO-DEBUG] VideoPlayer - Video element exists:",
      !!videoRef.current
    );
    console.log(
      "[AUDIO-DEBUG] VideoPlayer - Already connected:",
      audioConnectedRef.current
    );

    if (videoRef.current && !audioConnectedRef.current) {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        console.log(
          "[AUDIO-DEBUG] VideoPlayer - AudioContext available:",
          !!AudioContext
        );

        if (AudioContext) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
            console.log("[AUDIO-DEBUG] VideoPlayer - Created new AudioContext");
            console.log(
              "[AUDIO-DEBUG] VideoPlayer - AudioContext state:",
              audioContextRef.current.state
            );
          } else {
            console.log(
              "[AUDIO-DEBUG] VideoPlayer - Using existing AudioContext"
            );
            console.log(
              "[AUDIO-DEBUG] VideoPlayer - AudioContext state:",
              audioContextRef.current.state
            );
          }

          const source = audioContextRef.current.createMediaElementSource(
            videoRef.current
          );
          source.connect(audioContextRef.current.destination);
          audioConnectedRef.current = true;
          console.log(
            "[AUDIO-DEBUG] VideoPlayer - Connected video to AudioContext"
          );
        }
      } catch (err) {
        console.log(
          "[AUDIO-DEBUG] VideoPlayer - Error setting up AudioContext:",
          err
        );
        // If we can't use AudioContext, just unmute directly
        if (videoRef.current) {
          videoRef.current.muted = false;
          console.log(
            "[AUDIO-DEBUG] VideoPlayer - Forced muted=false directly as fallback"
          );
        }
      }
    } else if (audioConnectedRef.current) {
      console.log(
        "[AUDIO-DEBUG] VideoPlayer - Already connected to AudioContext"
      );
    }
  };

  const togglePlay = () => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Toggle play clicked");
    if (!videoRef.current) {
      console.log("[AUDIO-DEBUG] VideoPlayer - No video element found");
      return;
    }

    if (videoRef.current.paused) {
      console.log("[AUDIO-DEBUG] VideoPlayer - Attempting to play video");
      videoRef.current
        .play()
        .then(() => {
          console.log("[AUDIO-DEBUG] VideoPlayer - Play succeeded");
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("[AUDIO-DEBUG] VideoPlayer - Play error:", err);
          setIsPlaying(false);
        });
    } else {
      console.log("[AUDIO-DEBUG] VideoPlayer - Pausing video");
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Toggle mute clicked");
    e.stopPropagation();

    // If we're unmuting for the first time, set up the audio context
    if (isMuted) {
      console.log("[AUDIO-DEBUG] VideoPlayer - Attempting to unmute");
      setupAudioContext();
    } else {
      console.log("[AUDIO-DEBUG] VideoPlayer - Attempting to mute");
    }

    setIsMuted(!isMuted);
  };

  const handleMouseEnter = () => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Mouse enter");
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    console.log("[AUDIO-DEBUG] VideoPlayer - Mouse leave");
    setIsHovering(false);
  };

  // Helper function to combine class names conditionally
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // Get poster URL for video if available
  const thumbnailTransformed = thumbnailUrl
    ? transformImageUrl(thumbnailUrl)
    : null;
  const posterUrl = thumbnailTransformed || undefined;

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-md cursor-pointer"
        onClick={togglePlay}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Audio element for iOS Safari compatibility */}
        {!isMuted && isPlaying && (
          <audio
            src={videoUrl}
            autoPlay
            loop={loop}
            style={{ display: "none" }}
            onPlay={() =>
              console.log(
                "[AUDIO-DEBUG] VideoPlayer - Audio element started playing"
              )
            }
            onError={(e) =>
              console.log("[AUDIO-DEBUG] VideoPlayer - Audio element error:", e)
            }
          />
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop={loop}
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          controls={controls && isPlaying}
          onPlay={() => {
            console.log("[AUDIO-DEBUG] VideoPlayer - Video started playing");
            setIsPlaying(true);
          }}
          onPause={() => {
            console.log("[AUDIO-DEBUG] VideoPlayer - Video paused");
            setIsPlaying(false);
          }}
          onError={(e) =>
            console.log("[AUDIO-DEBUG] VideoPlayer - Video error:", e)
          }
          onLoadedMetadata={() =>
            console.log("[AUDIO-DEBUG] VideoPlayer - Video metadata loaded")
          }
        />

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
            isPlaying && !isHovering ? "opacity-0" : "opacity-100"
          )}
        >
          {!isPlaying && (
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
          aria-label={isMuted ? "הפעל שמע" : "השתק"}
          type="button"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
