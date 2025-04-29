"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@nextui-org/react";
import { Upload, VideoIcon } from "lucide-react";
import { VIDEO_UPLOAD_CONFIG } from "@/lib/aws-config";
import UploadProgress from "./UploadProgress";

interface VideoUploaderProps {
  memberId: string;
  onUploadComplete: () => void;
  onError: (message: string) => void;
  maxRetries?: number;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  memberId,
  onUploadComplete,
  onError,
  maxRetries = 3,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const currentFileRef = useRef<File | null>(null);

  // Convert webm to mp4 (more compatible format)
  const convertToMP4 = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary URL for the file
        const videoURL = URL.createObjectURL(file);

        // Create a video element to load the video
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(videoURL);

          // Create a canvas and capture stream
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }

          // Use MediaRecorder with mp4 codec
          const stream = canvas.captureStream(30);
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm", // We'll convert to MP4 on server
            videoBitsPerSecond: 2500000,
          });

          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/mp4" });
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
              {
                type: "video/mp4",
                lastModified: Date.now(),
              }
            );
            resolve(newFile);
          };

          // Start recording and playing
          mediaRecorder.start(100);
          video.play();

          // Draw frames
          const processFrame = () => {
            if (video.ended || video.paused) {
              mediaRecorder.stop();
              return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(processFrame);
          };

          processFrame();

          video.onended = () => {
            mediaRecorder.stop();
          };
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoURL);
          reject(new Error("Error loading video"));
        };

        video.src = videoURL;
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // Video compression function
  const compressVideo = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);

      // Create video element to load the file
      const video = document.createElement("video");
      video.preload = "metadata";

      // Create a URL for the video file
      const videoURL = URL.createObjectURL(file);

      video.onloadedmetadata = async () => {
        URL.revokeObjectURL(videoURL);

        try {
          // Calculate target dimensions (reduce size if large)
          const origWidth = video.videoWidth;
          const origHeight = video.videoHeight;

          // Target 720p max for larger videos
          const maxDimension = 720;
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

          // Create a canvas element to draw video frames
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Get the canvas context for drawing
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }

          // Create a MediaRecorder to record the compressed video
          const stream = canvas.captureStream(30); // 30 FPS
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm",
            videoBitsPerSecond: 2500000, // 2.5 Mbps
          });

          // Set up data handling
          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            // Create a blob from all the chunks
            const blob = new Blob(chunks, { type: "video/webm" });

            // Convert to File object - use MP4 format for better compatibility
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
              {
                type: "video/mp4",
                lastModified: Date.now(),
              }
            );

            // Check if we actually saved space
            if (compressedFile.size < file.size) {
              setIsCompressing(false);
              resolve(compressedFile);
            } else {
              // If compression didn't help, use the original
              setIsCompressing(false);
              resolve(file);
            }
          };

          // Start recording
          mediaRecorder.start(100); // Collect data in 100ms chunks

          // Play the video
          video.currentTime = 0;
          video.play();

          // Handle the video playback and progress
          let lastDrawnFrame = -1;

          const processFrame = () => {
            if (video.ended || video.paused) {
              mediaRecorder.stop();
              return;
            }

            // Only draw a new frame if the video has advanced
            if (video.currentTime !== lastDrawnFrame) {
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              lastDrawnFrame = video.currentTime;

              // Update progress (0-90%, leave 10% for final processing)
              const progress = Math.min(
                90,
                Math.round((video.currentTime / video.duration) * 90)
              );
              setUploadProgress(progress);
            }

            requestAnimationFrame(processFrame);
          };

          processFrame();

          // Handle video ended
          video.onended = () => {
            setTimeout(() => {
              if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
              }
              setUploadProgress(100);
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

      // Set the source and start loading
      video.src = videoURL;
    });
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      const fileType = file.type.toLowerCase();
      const fileSize = file.size;
      const maxSizeMB = Math.floor(
        VIDEO_UPLOAD_CONFIG.maxFileSize / 1024 / 1024
      );

      if (fileSize > VIDEO_UPLOAD_CONFIG.maxFileSize) {
        onError(
          `הקובץ גדול מדי (${(fileSize / 1024 / 1024).toFixed(
            1
          )} מ״ב). הגודל המקסימלי המותר הוא ${maxSizeMB} מ״ב`
        );
        return;
      }

      if (!VIDEO_UPLOAD_CONFIG.allowedTypes.includes(fileType as any)) {
        onError(
          `סוג הקובץ ${fileType} אינו נתמך. נתמכים רק קבצי MP4, MOV או AVI`
        );
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        // Compress video if larger than 7MB
        let fileToUpload = file;
        if (!isCompressing && file.size > 7 * 1024 * 1024) {
          try {
            setIsCompressing(true);
            fileToUpload = await compressVideo(file);
            setIsCompressing(false);
            // Reset progress since we'll start the actual upload now
            setUploadProgress(0);
          } catch (compressError) {
            console.warn(
              "Compression failed, using original file:",
              compressError
            );
            // If compression fails, continue with the original file
            setIsCompressing(false);
          }
        }

        // Store reference for retries
        currentFileRef.current = fileToUpload;

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append("memberId", memberId);

        // Add these fields to help server properly handle the file
        formData.append("filename", fileToUpload.name);
        formData.append("filesize", fileToUpload.size.toString());
        formData.append("filetype", fileToUpload.type);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("POST", "/api/videos", true);
        xhr.timeout = 5 * 60 * 1000; // 5 minute timeout

        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadSuccess(true);
            setTimeout(() => {
              setUploadSuccess(false);
              onUploadComplete();
            }, 1500);
          } else {
            let errorMsg = "ההעלאה נכשלה";
            let responseData = null;

            try {
              responseData = JSON.parse(xhr.responseText);
              if (responseData.error) {
                errorMsg = responseData.error;
              }
            } catch {}

            console.error(
              "Upload failed with status:",
              xhr.status,
              "Response:",
              xhr.responseText
            );

            // For 400 errors, try with original file if we're using compressed
            if (xhr.status === 400 && fileToUpload !== file && retryCount < 1) {
              console.log("Trying with original file instead of compressed");
              setRetryCount(1);
              setTimeout(() => {
                handleUpload(file);
              }, 1000);
              return;
            }

            // For 413 errors specifically, try to compress more aggressively
            if (xhr.status === 413 && retryCount < maxRetries) {
              setRetryCount((prev) => prev + 1);
              setTimeout(async () => {
                try {
                  setIsCompressing(true);
                  // More aggressive compression
                  const moreCompressed = await compressVideo(file);
                  setIsCompressing(false);
                  setUploadProgress(0);
                  // Try with more compressed file
                  handleUpload(moreCompressed);
                } catch (error) {
                  console.log(error);

                  setIsCompressing(false);
                  throw new Error("שגיאה בדחיסת הוידאו");
                }
              }, 1000);
              return;
            }

            // General retry logic for other errors
            if (retryCount < maxRetries) {
              setRetryCount((prev) => prev + 1);
              setTimeout(() => {
                if (currentFileRef.current) {
                  handleUpload(currentFileRef.current);
                }
              }, 2000 * (retryCount + 1));
              return;
            }

            throw new Error(errorMsg);
          }
        };

        xhr.onerror = () => {
          if (retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              if (currentFileRef.current) {
                handleUpload(currentFileRef.current);
              }
            }, 2000 * (retryCount + 1));
          } else {
            throw new Error("שגיאת תקשורת. בדוק את החיבור לאינטרנט ונסה שוב");
          }
        };

        xhr.ontimeout = () => {
          if (retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            setTimeout(() => {
              if (currentFileRef.current) {
                handleUpload(currentFileRef.current);
              }
            }, 2000 * (retryCount + 1));
          } else {
            throw new Error("פעולת ההעלאה ארכה זמן רב מדי. נסה שוב מאוחר יותר");
          }
        };

        xhr.send(formData);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "ההעלאה נכשלה";
        onError(errorMessage);
        setIsUploading(false);
        setRetryCount(0);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [
      memberId,
      onError,
      onUploadComplete,
      retryCount,
      maxRetries,
      compressVideo,
      isCompressing,
    ]
  );

  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload(e.dataTransfer.files[0]);
      }
    },
    [handleUpload]
  );

  const onButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleUpload(e.target.files[0]);
      }
    },
    [handleUpload]
  );

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setIsCompressing(false);
    setUploadProgress(0);
  }, []);

  if (isUploading) {
    return (
      <UploadProgress
        progress={uploadProgress}
        onCancel={cancelUpload}
        success={uploadSuccess}
        isCompressing={isCompressing}
      />
    );
  }

  const maxSizeMB = Math.floor(VIDEO_UPLOAD_CONFIG.maxFileSize / 1024 / 1024);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-all ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      dir="rtl"
      aria-label="אזור העלאת וידאו"
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="bg-blue-100 p-4 rounded-full">
          <VideoIcon className="h-8 w-8 text-blue-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {dragActive ? "שחרר את הסרטון כאן" : "גרור ושחרר את הסרטון כאן"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            MP4, MOV או AVI (מקסימום {maxSizeMB} מגה-בייט)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            סרטונים גדולים יעברו דחיסה אוטומטית
          </p>
        </div>
        <Button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onPress={onButtonClick}
          startContent={<Upload size={16} />}
          aria-label="בחר וידאו מהמחשב"
        >
          בחר סרטון
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={VIDEO_UPLOAD_CONFIG.allowedTypes.join(",")}
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default VideoUploader;
