"use client";

import { useReducer, useCallback } from "react";

interface CompressionOptions {
  maxDimension?: number;
  videoBitsPerSecond?: number;
  mimeType?: string;
}

interface CompressionState {
  isCompressing: boolean;
  compressionProgress: number;
}

type CompressionAction =
  | { type: "START_COMPRESSION" }
  | { type: "PROGRESS"; payload: number }
  | { type: "COMPLETE_COMPRESSION" };

const compressionReducer = (
  state: CompressionState,
  action: CompressionAction
): CompressionState => {
  switch (action.type) {
    case "START_COMPRESSION":
      return {
        ...state,
        isCompressing: true,
        compressionProgress: 0,
      };
    case "PROGRESS":
      return {
        ...state,
        compressionProgress: action.payload,
      };
    case "COMPLETE_COMPRESSION":
      return {
        ...state,
        isCompressing: false,
        compressionProgress: 100,
      };
    default:
      return state;
  }
};

// Size threshold for compression (7MB)
const COMPRESSION_SIZE_THRESHOLD = 7 * 1024 * 1024;

// Default compression settings
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxDimension: 720,
  videoBitsPerSecond: 2500000,
  mimeType: "video/webm;codecs=vp9",
};

export const useVideoCompression = () => {
  const [state, dispatch] = useReducer(compressionReducer, {
    isCompressing: false,
    compressionProgress: 0,
  });

  const compressVideo = useCallback(
    async (
      file: File,
      options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
    ): Promise<File> => {
      // Skip compression for small files
      if (file.size <= COMPRESSION_SIZE_THRESHOLD) {
        return file;
      }

      dispatch({ type: "START_COMPRESSION" });

      // Merge with default options
      const compressOptions = {
        ...DEFAULT_COMPRESSION_OPTIONS,
        ...options,
      };

      try {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);

        video.muted = true;
        video.autoplay = false;
        video.preload = "metadata";

        return new Promise<File>((resolve) => {
          const cleanup = () => {
            URL.revokeObjectURL(url);
            dispatch({ type: "COMPLETE_COMPRESSION" });
          };

          video.onloadedmetadata = () => {
            video.currentTime = 0;

            video.onseeked = async () => {
              try {
                const originalWidth = video.videoWidth;
                const originalHeight = video.videoHeight;

                // Calculate dimensions while maintaining aspect ratio
                const { width, height } = calculateDimensions(
                  originalWidth,
                  originalHeight,
                  compressOptions.maxDimension || 720
                );

                // Setup canvas for frame processing
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                  throw new Error(
                    "Could not get canvas context for compression"
                  );
                }

                // Setup MediaRecorder for video encoding
                const stream = canvas.captureStream();
                const mediaRecorder = new MediaRecorder(stream, {
                  mimeType: compressOptions.mimeType || "video/webm;codecs=vp9",
                  videoBitsPerSecond:
                    compressOptions.videoBitsPerSecond || 2500000,
                });

                const chunks: Blob[] = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

                mediaRecorder.onstop = () => {
                  cleanup();
                  const blob = new Blob(chunks, { type: "video/webm" });

                  // Create new file with compressed data
                  const compressedFile = new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, "") + "_compressed.webm",
                    {
                      type: "video/webm",
                      lastModified: Date.now(),
                    }
                  );

                  resolve(compressedFile);
                };

                mediaRecorder.start();

                // Process video frames at specified FPS
                const duration = video.duration;
                const fps = 30;
                const totalFrames = Math.floor(duration * fps);
                let frameCount = 0;

                const processFrame = () => {
                  if (video.ended || frameCount >= totalFrames) {
                    mediaRecorder.stop();
                    return;
                  }

                  ctx.drawImage(video, 0, 0, width, height);
                  frameCount++;

                  // Update compression progress
                  const progress = Math.min(
                    Math.floor((frameCount / totalFrames) * 100),
                    99
                  );
                  dispatch({ type: "PROGRESS", payload: progress });

                  // Move to next frame
                  video.currentTime = frameCount / fps;
                  video.onseeked = processFrame;
                };

                processFrame();
              } catch (error) {
                console.error("Video compression error:", error);
                cleanup();
                resolve(file); // Fall back to original file on error
              }
            };
          };

          // Handle video loading errors
          video.onerror = () => {
            console.error("Error loading video for compression");
            cleanup();
            resolve(file);
          };

          video.src = url;
        });
      } catch (error) {
        console.error("Video compression setup error:", error);
        dispatch({ type: "COMPLETE_COMPRESSION" });
        return file;
      }
    },
    []
  );

  return {
    compressVideo,
    isCompressing: state.isCompressing,
    compressionProgress: state.compressionProgress,
  };
};

// Helper function to calculate dimensions while maintaining aspect ratio
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  const targetWidth = Math.min(originalWidth, maxDimension);
  const targetHeight = Math.min(originalHeight, maxDimension);
  const scaleFactor = Math.min(
    targetWidth / originalWidth,
    targetHeight / originalHeight
  );

  return {
    width: Math.floor(originalWidth * scaleFactor),
    height: Math.floor(originalHeight * scaleFactor),
  };
}

export default useVideoCompression;
