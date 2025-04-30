"use client";

import { useState } from "react";

interface CompressionOptions {
  maxDimension?: number;
  videoBitsPerSecond?: number;
  fps?: number;
}

export const useVideoCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const compressVideo = async (
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);
      setCompressionProgress(0);

      const video = document.createElement("video");
      video.preload = "metadata";

      const videoURL = URL.createObjectURL(file);

      video.onloadedmetadata = async () => {
        URL.revokeObjectURL(videoURL);

        try {
          const origWidth = video.videoWidth;
          const origHeight = video.videoHeight;

          const maxDimension = options.maxDimension || 720;
          let targetWidth = origWidth;
          let targetHeight = origHeight;

          if (origWidth > maxDimension || origHeight > maxDimension) {
            if (origWidth > origHeight) {
              targetWidth = maxDimension;
              targetHeight = Math.round(
                (origHeight / origWidth) * maxDimension
              );
            } else {
              targetHeight = maxDimension;
              targetWidth = Math.round((origWidth / origHeight) * maxDimension);
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }

          const stream = canvas.captureStream(options.fps || 30);
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm",
            videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
          });

          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
              {
                type: "video/mp4",
                lastModified: Date.now(),
              }
            );

            if (compressedFile.size < file.size) {
              setIsCompressing(false);
              resolve(compressedFile);
            } else {
              setIsCompressing(false);
              resolve(file);
            }
          };

          mediaRecorder.start(100);

          video.currentTime = 0;
          video.play();

          let lastDrawnFrame = -1;

          const processFrame = () => {
            if (video.ended || video.paused) {
              mediaRecorder.stop();
              return;
            }

            if (video.currentTime !== lastDrawnFrame) {
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              lastDrawnFrame = video.currentTime;

              const progress = Math.min(
                90,
                Math.round((video.currentTime / video.duration) * 90)
              );
              setCompressionProgress(progress);
            }

            requestAnimationFrame(processFrame);
          };

          processFrame();

          video.onended = () => {
            setTimeout(() => {
              if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
              }
              setCompressionProgress(100);
            }, 100);
          };
        } catch (error) {
          setIsCompressing(false);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoURL);
        setIsCompressing(false);
        reject(new Error("שגיאה בטעינת הוידאו לדחיסה"));
      };

      video.src = videoURL;
    });
  };

  return {
    compressVideo,
    isCompressing,
    compressionProgress,
  };
};
