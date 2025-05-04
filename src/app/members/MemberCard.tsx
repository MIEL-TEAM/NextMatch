"use client";

import React, { useReducer, useEffect, useRef, useCallback } from "react";
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

interface MemberCardState {
  hasLiked: boolean;
  loading: boolean;
  showVideo: boolean;
  activeVideo: string | null;
  currentIndex: number;
  isMuted: boolean;
}

type MemberCardAction =
  | { type: "SET_LIKED"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SHOW_VIDEO"; payload: boolean }
  | { type: "SET_ACTIVE_VIDEO"; payload: string }
  | { type: "SET_INDEX"; payload: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_LIKE" };

const memberCardReducer = (
  state: MemberCardState,
  action: MemberCardAction
): MemberCardState => {
  switch (action.type) {
    case "SET_LIKED":
      return { ...state, hasLiked: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SHOW_VIDEO":
      return { ...state, showVideo: action.payload };
    case "SET_ACTIVE_VIDEO":
      return { ...state, activeVideo: action.payload };
    case "SET_INDEX":
      return { ...state, currentIndex: action.payload };
    case "TOGGLE_MUTE":
      return { ...state, isMuted: !state.isMuted };
    case "TOGGLE_LIKE":
      return { ...state, hasLiked: !state.hasLiked };
    default:
      return state;
  }
};

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
  memberVideos = [],
}: MemberCardProps) {
  const [state, dispatch] = useReducer(memberCardReducer, {
    hasLiked: likeIds.includes(member.userId),
    loading: false,
    showVideo: false,
    activeVideo: null,
    currentIndex: 0,
    isMuted: true,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const handleIndexChange = useCallback((index: number) => {
    dispatch({ type: "SET_INDEX", payload: index });
  }, []);

  useEffect(() => {
    if (memberVideos.length > 0 && !state.activeVideo) {
      dispatch({ type: "SET_ACTIVE_VIDEO", payload: memberVideos[0].url });
    }
  }, [memberVideos, state.activeVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = state.isMuted;
    }
  }, [state.isMuted]);

  useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && !videoElement.paused) {
        videoElement.pause();
      }
    };
  }, []);

  const playVideo = () => {
    if (!videoRef.current || !state.showVideo) return;

    if (playPromiseRef.current) {
      videoRef.current.pause();
    }

    playPromiseRef.current = videoRef.current.play();
    playPromiseRef.current.catch(() => {
      playPromiseRef.current = null;
    });
  };

  const pauseVideo = () => {
    if (!videoRef.current) return;

    if (!videoRef.current.paused) {
      videoRef.current.pause();
    }

    playPromiseRef.current = null;
  };

  async function handleToggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await toggleLikeMember(member.userId, state.hasLiked);
      dispatch({ type: "TOGGLE_LIKE" });
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  const toggleMute = (_e: React.MouseEvent) => {
    _e.preventDefault();
    _e.stopPropagation();
    dispatch({ type: "TOGGLE_MUTE" });
  };

  const handleMouseEnter = () => {
    if (memberVideos.length > 0 && state.activeVideo) {
      dispatch({ type: "SHOW_VIDEO", payload: true });
      setTimeout(() => {
        playVideo();
      }, 100);
    }
  };

  const handleMouseLeave = () => {
    pauseVideo();
    dispatch({ type: "SHOW_VIDEO", payload: false });
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
        {state.showVideo && state.activeVideo && (
          <div className="absolute inset-0 z-40 overflow-hidden">
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={state.activeVideo}
                muted={state.isMuted}
                loop
                playsInline
                preload="auto"
                crossOrigin="anonymous"
              />
              <button
                onClick={toggleMute}
                className="absolute bottom-2 right-2 z-50 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-md"
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
        )}

        <Image
          alt={member.name}
          src={transformImageUrl(imageUrl) || "/images/user.png"}
          className={`w-full h-full object-cover transition-all duration-500 ease-in-out transform group-hover:scale-110 ${
            state.showVideo ? "opacity-0" : "opacity-100"
          }`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />

        <div className="absolute top-2 right-2 z-50">
          <PresenceDot member={member} />
        </div>

        <div className="absolute top-2 left-2 z-50 flex gap-1 items-center">
          <LikeButton
            loading={state.loading}
            toggleLike={handleToggleLike}
            hasLiked={state.hasLiked}
          />
          {memberVideos.length > 0 && state.showVideo && (
            <button
              onClick={toggleMute}
              className="bg-black/70 hover:bg-black/90 rounded-full p-2 transition-all duration-200 flex items-center justify-center shadow-lg ring-2 ring-blue-400/60 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/80"
              aria-label={state.isMuted ? "הפעל שמע" : "השתק"}
              type="button"
            >
              {state.isMuted ? (
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
            {memberVideos.length > 0 && !state.showVideo && (
              <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/30"></div>
                  <div className="relative z-10 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Play className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>
            )}

            {memberVideos.length > 0 && state.showVideo && (
              <div className="bg-white/20 backdrop-blur-[1px] rounded-md p-1 flex items-center justify-center border border-white/10">
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white" fill="white" />
                </div>
              </div>
            )}

            {memberPhotos.length > 1 && (
              <div className="flex items-center bg-white/20 backdrop-blur-[1px] rounded-md px-1.5 py-0.5 border border-white/10">
                <span className="text-white text-[10px] font-medium tracking-tight">
                  {state.currentIndex + 1}/{memberPhotos.length}
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
        onIndexChange={handleIndexChange}
        prioritizeFirstImage={true}
      >
        {(currentImage) => renderCardContent(currentImage.url)}
      </MemberImageCarousel>
    </div>
  );
}
