"use client";

import React, { useState, useRef, useEffect } from "react";
import { transformImageUrl } from "@/lib/util";
import { Play, Volume2, VolumeX } from "lucide-react";

interface VideoSectionProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
}

export default function VideoSection({
  videoUrl,
  thumbnailUrl,
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioConnectedRef = useRef<boolean>(false);

  // Log initial component setup
  useEffect(() => {
    console.log("[AUDIO-DEBUG] VideoSection - Component mounted");
    console.log("[AUDIO-DEBUG] VideoSection - Video URL:", videoUrl);

    return () => {
      console.log("[AUDIO-DEBUG] VideoSection - Component unmounted");
    };
  }, [videoUrl]);

  useEffect(() => {
    // Update video muted state when isMuted changes
    console.log("[AUDIO-DEBUG] VideoSection - Mute state changed:", isMuted);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      console.log(
        "[AUDIO-DEBUG] VideoSection - Set video.muted to:",
        videoRef.current.muted
      );
    }
  }, [isMuted]);

  // Setup audio context when unmuting for the first time
  const setupAudioContext = () => {
    console.log("[AUDIO-DEBUG] VideoSection - Setting up AudioContext");
    console.log(
      "[AUDIO-DEBUG] VideoSection - Video element exists:",
      !!videoRef.current
    );
    console.log(
      "[AUDIO-DEBUG] VideoSection - Already connected:",
      audioConnectedRef.current
    );

    if (videoRef.current && !audioConnectedRef.current) {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        console.log(
          "[AUDIO-DEBUG] VideoSection - AudioContext available:",
          !!AudioContext
        );

        if (AudioContext) {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
            console.log(
              "[AUDIO-DEBUG] VideoSection - Created new AudioContext"
            );
            console.log(
              "[AUDIO-DEBUG] VideoSection - AudioContext state:",
              audioContextRef.current.state
            );
          } else {
            console.log(
              "[AUDIO-DEBUG] VideoSection - Using existing AudioContext"
            );
            console.log(
              "[AUDIO-DEBUG] VideoSection - AudioContext state:",
              audioContextRef.current.state
            );
          }

          const source = audioContextRef.current.createMediaElementSource(
            videoRef.current
          );
          source.connect(audioContextRef.current.destination);
          audioConnectedRef.current = true;
          console.log(
            "[AUDIO-DEBUG] VideoSection - Connected video to AudioContext"
          );
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        console.log(
          "[AUDIO-DEBUG] VideoSection - Error setting up AudioContext:",
          err
        );
        // If we can't use AudioContext, just unmute directly
        if (videoRef.current) {
          videoRef.current.muted = false;
          console.log(
            "[AUDIO-DEBUG] VideoSection - Forced muted=false directly as fallback"
          );
        }
      }
    } else if (audioConnectedRef.current) {
      console.log(
        "[AUDIO-DEBUG] VideoSection - Already connected to AudioContext"
      );
    }
  };

  const togglePlay = () => {
    console.log("[AUDIO-DEBUG] VideoSection - Toggle play clicked");
    if (!videoRef.current) {
      console.log("[AUDIO-DEBUG] VideoSection - No video element found");
      return;
    }

    if (videoRef.current.paused) {
      console.log("[AUDIO-DEBUG] VideoSection - Attempting to play video");
      videoRef.current
        .play()
        .then(() => {
          console.log("[AUDIO-DEBUG] VideoSection - Play succeeded");
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("[AUDIO-DEBUG] VideoSection - Play error:", err);
          setIsPlaying(false);
        });
    } else {
      console.log("[AUDIO-DEBUG] VideoSection - Pausing video");
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    console.log("[AUDIO-DEBUG] VideoSection - Toggle mute clicked");
    e.stopPropagation();

    // If we're unmuting for the first time, set up the audio context
    if (isMuted) {
      console.log("[AUDIO-DEBUG] VideoSection - Attempting to unmute");
      setupAudioContext();
    } else {
      console.log("[AUDIO-DEBUG] VideoSection - Attempting to mute");
    }

    setIsMuted(!isMuted);
  };

  const handleMouseEnter = () => {
    console.log("[AUDIO-DEBUG] VideoSection - Mouse enter");
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    console.log("[AUDIO-DEBUG] VideoSection - Mouse leave");
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
    <div className="p-0 overflow-hidden">
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
            loop
            style={{ display: "none" }}
            onPlay={() =>
              console.log(
                "[AUDIO-DEBUG] VideoSection - Audio element started playing"
              )
            }
            onError={(e) =>
              console.log(
                "[AUDIO-DEBUG] VideoSection - Audio element error:",
                e
              )
            }
          />
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          onPlay={() =>
            console.log("[AUDIO-DEBUG] VideoSection - Video started playing")
          }
          onError={(e) =>
            console.log("[AUDIO-DEBUG] VideoSection - Video error:", e)
          }
          onLoadedMetadata={() =>
            console.log("[AUDIO-DEBUG] VideoSection - Video metadata loaded")
          }
        />

        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
            isPlaying && !isHovering ? "opacity-0" : "opacity-100"
          )}
        >
          <button
            className="h-14 w-14 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
            onClick={togglePlay}
          >
            <Play className="h-6 w-6 text-white fill-white" />
          </button>
        </div>

        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
          aria-label={isMuted ? "הפעל שמע" : "השתק"}
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
