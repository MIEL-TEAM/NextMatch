"use client";

import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import VideoPlayer from "@/components/video/VideoPlayer";

export interface InvitationCardProps {
  image: string | null;
  videoUrl?: string | null;
  name: string;
  title: string;
  subtitle?: string;
  onAction: () => void;
  onDismiss: () => void;
}

export default function InvitationCard({
  image,
  videoUrl,
  name,
  title,
  subtitle,
  onAction,
  onDismiss,
}: InvitationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.3
      }}
      className="w-full aspect-square"
    >
      <div
        onClick={() => {
          onAction();
          onDismiss();
        }}
        className="
            relative
            w-full
            h-full
            bg-white dark:bg-gray-900
            rounded-2xl sm:rounded-[20px]
            shadow-2xl
            overflow-hidden
            border border-gray-100 dark:border-gray-800
            cursor-pointer
            active:scale-[0.98]
            transition-transform
            duration-150
          "
      >
        {/* Background Media - Video or Image */}
        <div className="absolute inset-0">
          {videoUrl ? (
            <div onClick={(e) => e.stopPropagation()}>
              <VideoPlayer
                url={videoUrl}
                autoPlay={true}
                loop={true}
                muted={true}
                className="rounded-none w-full h-full"
              />
            </div>
          ) : image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
              <span className="text-7xl sm:text-8xl font-bold text-orange-600">
                {name.charAt(0)}
              </span>
            </div>
          )}

          {/* Dark gradient overlay for content readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/0" />
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="
              absolute top-3 left-3 z-20
              w-10 h-10 sm:w-9 sm:h-9
              flex items-center justify-center
              rounded-full
              bg-black/30 backdrop-blur-md
              sm:hover:bg-black/40 active:bg-black/40
              transition-colors
              touch-manipulation
            "
          aria-label="סגור"
        >
          <IoClose className="text-white" size={24} />
        </button>

        {/* Content Section - Positioned at bottom */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-3 sm:px-6 sm:pb-3 z-10" dir="rtl">
          {/* Online indicator */}
          <div className="mb-4 flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/30 w-fit">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-300" />
            <span className="text-xs font-semibold text-white">
              פעיל/ה עכשיו
            </span>
          </div>

          {/* Text Content */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm sm:text-base text-white/90 leading-relaxed drop-shadow-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}