"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player/lazy";
import { Volume2, VolumeX } from "lucide-react";

interface MiniPlayerProps {
  url: string;
  onMuteToggle?: (isMuted: boolean) => void;
  initMuted?: boolean;
  className?: string;
  onReady?: () => void;
  onError?: (error: any) => void;
  loop?: boolean;
  playbackRate?: number;
  forceShowMuteControls?: boolean;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  url,
  onMuteToggle,
  initMuted = true,
  className = "",
  onReady,
  onError,
  loop = true,
  playbackRate = 1.0,
  forceShowMuteControls = true,
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(initMuted);
  const [isReady, setIsReady] = useState<boolean>(false);
  const playerRef = useRef<ReactPlayer | null>(null);

  // Handle ready state
  const handleReady = (): void => {
    setIsReady(true);
    setPlaying(true);

    // Set playback rate using ReactPlayer's API
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player instanceof HTMLVideoElement) {
        player.playbackRate = playbackRate;
      }
    }

    if (onReady) onReady();
  };

  // Handle errors
  const handleError = (error: any): void => {
    if (onError) onError(error);
  };

  // Handle mute toggle using ReactPlayer's API
  const handleMuteToggle = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    if (onMuteToggle) {
      onMuteToggle(newMuteState);
    }
  };

  // Sync parent component's mute state with internal state
  useEffect(() => {
    setIsMuted(initMuted);
  }, [initMuted]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        loop={loop}
        muted={isMuted}
        volume={1}
        playsinline
        onReady={handleReady}
        onError={handleError}
        config={{
          file: {
            attributes: {
              preload: "auto",
              controlsList: "nodownload nofullscreen noremoteplayback",
              disablePictureInPicture: true,
              style: { width: "100%", height: "100%", objectFit: "cover" },
            },
            forceVideo: true,
          },
          youtube: {
            playerVars: {
              autoplay: 0,
              controls: 0,
              playsinline: 1,
              modestbranding: 1,
              rel: 0,
            },
          },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          backgroundColor: "#000",
        }}
      />

      {/* Mute/unmute button */}
      {isReady && forceShowMuteControls && (
        <button
          onClick={handleMuteToggle}
          className="absolute bottom-2 right-2 z-50 bg-black/70 hover:bg-black/90 rounded-full p-2.5 transition-all duration-200 flex items-center justify-center shadow-lg"
          aria-label={isMuted ? "Unmute" : "Mute"}
          type="button"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;
