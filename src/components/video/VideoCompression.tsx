"use client";

import { useState } from "react";

interface CompressionOptions {
  maxDimension?: number;
  videoBitsPerSecond?: number;
  fps?: number;
  preserveAudio?: boolean;
}

export const useVideoCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  /**
   * Compression function that currently returns the original file to preserve audio
   * options is kept in the signature for future implementation of actual compression
   */
  const compressVideo = async (
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> => {
    return new Promise((resolve) => {
      console.log("[VIDEO-DEBUG] Starting compression with options:", options);
      console.log("[VIDEO-DEBUG] Original file:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      setIsCompressing(true);
      setCompressionProgress(0);

      const isProd =
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1";

      const shouldPreserveAudio = isProd || options.preserveAudio !== false;
      console.log("[VIDEO-DEBUG] Environment:", {
        isProd,
        shouldPreserveAudio,
      });

      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setCompressionProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setIsCompressing(false);
            console.log(
              "[VIDEO-DEBUG] Compression complete, returning original file"
            );
            resolve(file);
          }
        }, 100);
      };

      simulateProgress();
    });
  };

  return {
    compressVideo,
    isCompressing,
    compressionProgress,
  };
};

export default useVideoCompression;
