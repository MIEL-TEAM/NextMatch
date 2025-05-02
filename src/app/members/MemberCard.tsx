"use client";

import React, { useState, useEffect, useRef } from "react";
import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { Card, CardFooter } from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { toggleLikeMember } from "@/app/actions/likeActions";
import MemberImageCarousel from "@/components/MemberImageCarousel";
import { Play, Volume2, VolumeX } from "lucide-react";

type MemberCardProps = {
  member: Member;
  likeIds: string[];
  memberPhotos?: Array<{ url: string; id: string }>;
  memberVideos?: Array<{ url: string; id: string }>;
};

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
  memberVideos = [],
}: MemberCardProps) {
  const [hasLiked, setHasLiked] = useState(likeIds.includes(member.userId));
  const [loading, setLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (memberVideos.length > 0 && !activeVideo) {
      setActiveVideo(memberVideos[0].url);
    }
  }, [memberVideos, activeVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      await toggleLikeMember(member.userId, hasLiked);
      setHasLiked(!hasLiked);
    } catch {
      // Error silently handled
    } finally {
      setLoading(false);
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newMutedState = !isMuted;
    console.log(
      "[AUDIO-DEBUG] MemberCard - Toggle mute clicked, new state:",
      newMutedState
    );
    console.log(
      "[AUDIO-DEBUG] MemberCard - Video element exists:",
      !!videoRef.current
    );
    console.log("[AUDIO-DEBUG] MemberCard - Active video URL:", activeVideo);

    setIsMuted(newMutedState);

    // More aggressive approach to force unmuting in production
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
      console.log(
        "[AUDIO-DEBUG] MemberCard - Set video.muted to:",
        newMutedState
      );

      // If we're unmuting, try to force audio playback
      if (!newMutedState) {
        console.log("[AUDIO-DEBUG] MemberCard - Attempting to unmute");

        // Try to force a new audio context only if not already connected
        try {
          if (!audioConnectedRef.current) {
            const AudioContext =
              window.AudioContext || (window as any).webkitAudioContext;
            console.log(
              "[AUDIO-DEBUG] MemberCard - AudioContext available:",
              !!AudioContext
            );

            if (AudioContext) {
              // Create audio context only once
              if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
                console.log(
                  "[AUDIO-DEBUG] MemberCard - Created new AudioContext"
                );
                console.log(
                  "[AUDIO-DEBUG] MemberCard - AudioContext state:",
                  audioContextRef.current.state
                );
              } else {
                console.log(
                  "[AUDIO-DEBUG] MemberCard - Using existing AudioContext"
                );
                console.log(
                  "[AUDIO-DEBUG] MemberCard - AudioContext state:",
                  audioContextRef.current.state
                );
              }

              const source = audioContextRef.current.createMediaElementSource(
                videoRef.current
              );
              source.connect(audioContextRef.current.destination);
              audioConnectedRef.current = true;
              console.log(
                "[AUDIO-DEBUG] MemberCard - Connected video to AudioContext"
              );
            }
          } else {
            console.log(
              "[AUDIO-DEBUG] MemberCard - Already connected to AudioContext"
            );
          }
        } catch (e) {
          console.log("[AUDIO-DEBUG] MemberCard - AudioContext error:", e);
          // If there's an error, just make sure video is unmuted directly
          if (videoRef.current) {
            videoRef.current.muted = false;
            console.log(
              "[AUDIO-DEBUG] MemberCard - Forced muted=false directly as fallback"
            );
          }
        }

        // Force playback to restart to trigger audio
        const playPromise = videoRef.current.play();
        console.log("[AUDIO-DEBUG] MemberCard - Attempted to play video");

        if (playPromise !== undefined) {
          playPromise
            .then(() =>
              console.log("[AUDIO-DEBUG] MemberCard - Play succeeded")
            )
            .catch((err) =>
              console.log("[AUDIO-DEBUG] MemberCard - Play failed:", err)
            );
        }
      }
    }
  };

  const handleMouseEnter = () => {
    if (memberVideos.length > 0 && activeVideo) {
      setShowVideo(true);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const renderCardContent = (imageUrl: string) => (
    <Card
      as={Link}
      href={`/members/${member.userId}`}
      isPressable
      className="w-full h-full shadow-lg hover:shadow-xl transition-shadow"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg group">
        {showVideo && activeVideo && (
          <div className="absolute inset-0 z-40 overflow-hidden">
            <div className="relative w-full h-full">
              {/* Fallback audio element for when video audio doesn't work */}
              {!isMuted && (
                <audio
                  src={activeVideo}
                  autoPlay
                  loop
                  style={{ display: "none" }}
                />
              )}

              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
              >
                <source src={activeVideo} type="video/mp4" />
                <source src={activeVideo} type="video/quicktime" />
                <source src={activeVideo} type="video/x-msvideo" />
                הדפדפן שלך אינו תומך בתג וידאו.
              </video>
              <button
                onClick={toggleMute}
                className="absolute bottom-2 right-2 z-50 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
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
        )}

        <Image
          alt={member.name}
          src={transformImageUrl(imageUrl) || "/images/user.png"}
          className={`w-full h-full object-cover transition-all duration-500 ease-in-out transform group-hover:scale-110 ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />

        <div className="absolute top-2 right-2 z-50">
          <PresenceDot member={member} />
        </div>

        <div className="absolute top-2 left-2 z-50 flex gap-1 items-center">
          <LikeButton
            loading={loading}
            toggleLike={toggleLike}
            hasLiked={hasLiked}
          />
          {memberVideos.length > 0 && showVideo && (
            <button
              onClick={toggleMute}
              className="bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-lg ring-2 ring-blue-400/60 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/80"
              aria-label={isMuted ? "הפעל שמע" : "השתק"}
              type="button"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
              ) : (
                <Volume2 className="w-5 h-5 text-white drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
              )}
            </button>
          )}
        </div>

        <CardFooter
          className="flex items-center justify-between overflow-hidden absolute bottom-0 z-50 w-full px-3 py-2 bg-black/50 backdrop-blur-[2px]"
          dir="rtl"
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white font-medium">
                {member.city}
              </span>
              <span className="text-xs text-white/80 font-medium">
                {calculateAge(member.dateOfBirth)}
              </span>
            </div>
            <span className="font-semibold text-sm text-white">
              {member.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {memberVideos.length > 0 && !showVideo && (
              <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/30"></div>
                  <div className="relative z-10 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
            )}

            {memberVideos.length > 0 && showVideo && (
              <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white" fill="white" />
                </div>
              </div>
            )}

            {memberPhotos.length > 1 && (
              <div className="flex items-center bg-white/20 backdrop-blur-[1px] rounded-md px-1.5 py-0.5 border border-white/10">
                <span className="text-white text-[10px] font-medium tracking-tight">
                  {currentIndex + 1}/{memberPhotos.length}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );

  if (memberPhotos.length <= 1) {
    const defaultImage =
      memberPhotos.length === 1 ? memberPhotos[0].url : "/images/user.png";
    return renderCardContent(defaultImage);
  }

  return (
    <div className="group">
      <MemberImageCarousel
        images={memberPhotos}
        onIndexChange={setCurrentIndex}
      >
        {(currentImage) => renderCardContent(currentImage.url)}
      </MemberImageCarousel>
    </div>
  );
}
