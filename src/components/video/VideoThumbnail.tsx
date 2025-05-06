"use client";

import React, { useCallback, memo } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface VideoThumbnailProps {
  thumbnailUrl?: string;
  onPlayClick: () => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  thumbnailUrl,
  onPlayClick,
}) => {
  // Prevent default behavior and propagation
  const handleClick = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    onPlayClick();
  }, [onPlayClick]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Video thumbnail"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="bg-gray-900 w-full h-full flex items-center justify-center">
            <div className="text-gray-500">No thumbnail</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-black/60 rounded-full p-4 cursor-pointer"
            onClick={handleClick}
          >
            <Play className="w-12 h-12 text-white" fill="white" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(VideoThumbnail);