"use client";

import React, { useState, useRef, useCallback } from "react";
import { VIDEO_UPLOAD_CONFIG } from "@/lib/aws-config";
import UploadProgress from "./UploadProgress";
import DragDropUpload from "./DragDropUpload";
import { useVideoCompression } from "./VideoCompression";

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
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { compressVideo, isCompressing, compressionProgress } =
    useVideoCompression();
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const currentFileRef = useRef<File | null>(null);

  const uploadToServer = useCallback(
    async (fileToUpload: File) => {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("memberId", memberId);

      formData.append("filename", fileToUpload.name);
      formData.append("filesize", fileToUpload.size.toString());
      formData.append("filetype", fileToUpload.type);

      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("POST", "/api/videos", true);
        xhr.timeout = 5 * 60 * 1000;

        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let errorMsg = "ההעלאה נכשלה";
            try {
              const responseData = JSON.parse(xhr.responseText);
              if (responseData.error) {
                errorMsg = responseData.error;
              }
            } catch {}

            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error("שגיאת תקשורת. בדוק את החיבור לאינטרנט ונסה שוב"));
        };

        xhr.ontimeout = () => {
          reject(new Error("פעולת ההעלאה ארכה זמן רב מדי. נסה שוב מאוחר יותר"));
        };

        xhr.send(formData);
      });
    },
    [memberId]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      const validateFile = (file: File): boolean => {
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
          return false;
        }

        if (!VIDEO_UPLOAD_CONFIG.allowedTypes.includes(fileType as any)) {
          onError(
            `סוג הקובץ ${fileType} אינו נתמך. נתמכים רק קבצי MP4, MOV או AVI`
          );
          return false;
        }

        return true;
      };

      if (!file || !validateFile(file)) return;

      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        currentFileRef.current = file;

        let fileToUpload = file;
        if (file.size > 7 * 1024 * 1024) {
          try {
            fileToUpload = await compressVideo(file);
            setUploadProgress(0);
          } catch {
            // Silently continue with original file if compression fails
          }
        }

        await uploadToServer(fileToUpload);

        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          onUploadComplete();
        }, 1500);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "ההעלאה נכשלה";

        if (
          error instanceof Error &&
          error.message.includes("413") &&
          retryCount < maxRetries
        ) {
          setRetryCount((prev) => prev + 1);
          setTimeout(async () => {
            try {
              const moreCompressed = await compressVideo(file, {
                maxDimension: 480,
                videoBitsPerSecond: 1000000,
              });
              setUploadProgress(0);

              handleUpload(moreCompressed);
            } catch {
              onError("שגיאה בדחיסת הוידאו");
              setIsUploading(false);
            }
          }, 1000);
          return;
        }

        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            if (currentFileRef.current) {
              handleUpload(currentFileRef.current);
            }
          }, 2000 * (retryCount + 1));
          return;
        }

        onError(errorMessage);
        setIsUploading(false);
        setRetryCount(0);
      }
    },
    [
      compressVideo,
      uploadToServer,
      onError,
      onUploadComplete,
      retryCount,
      maxRetries,
    ]
  );

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  if (isUploading) {
    return (
      <UploadProgress
        progress={isCompressing ? compressionProgress : uploadProgress}
        onCancel={cancelUpload}
        success={uploadSuccess}
        isCompressing={isCompressing}
      />
    );
  }

  return <DragDropUpload onFileSelected={handleUpload} />;
};

export default VideoUploader;
