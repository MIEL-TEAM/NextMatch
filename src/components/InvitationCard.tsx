"use client";

import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/video/VideoPlayer";

export interface InvitationCardProps {
  image: string | null;
  videoUrl?: string | null;
  name: string;
  title: string;
  subtitle?: string;
  userId?: string;
  onAction: () => void;
  onDismiss: () => void;
}

export default function InvitationCard({
  image,
  videoUrl,
  name,
  subtitle,
  userId,
  onAction,
  onDismiss,
}: InvitationCardProps) {
  const router = useRouter();

  function handleCardClick() {
    onAction();
    onDismiss();
    if (userId) {
      router.push(`/members/${userId}`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      className="w-full aspect-square"
    >
      <div
        onClick={handleCardClick}
        className="
          relative
          w-full
          h-full
          rounded-2xl
          shadow-2xl
          overflow-hidden
          cursor-pointer
          active:scale-[0.98]
          transition-transform
          duration-150
        "
      >
        {/* 🎥 Background Media */}
        <div className="absolute inset-0 z-0">
          {videoUrl ? (
            <VideoPlayer
              url={videoUrl}
              autoPlay
              loop
              muted
              showControls={false}
              showMuteControl={true}
              aspectRatio="fill"
              className="w-full h-full object-cover brightness-105"
            />
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
              <span className="text-7xl font-bold text-orange-600">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* ❌ Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="
            absolute
            top-3
            right-3
            z-30
            w-8
            h-8
            flex
            items-center
            justify-center
            rounded-full
            bg-black/40
            text-white
            hover:bg-black/60
            transition
          "
          aria-label="סגור"
        >
          <IoClose size={18} />
        </button>

        {/* 🌑 Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

        {/* 👤 Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-3 px-5 pb-5 pointer-events-none">
          {image && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0 pointer-events-auto">
              <Image
                src={image}
                alt={name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          )}
          <div>
            <p className="text-white text-lg font-bold drop-shadow-xl">
              {name}
            </p>
            <p className="text-white/80 text-sm drop-shadow-md">
              {subtitle ?? "מחוברת עכשיו"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}