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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const currentFileRef = useRef<File | null>(null);

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
        currentFileRef.current = file;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("memberId", memberId);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.open("POST", "/api/videos", true);

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
            try {
              const errorData = JSON.parse(xhr.responseText);
              if (errorData.error) {
                errorMsg = errorData.error;
              }
            } catch {}

            if (retryCount < maxRetries) {
              setRetryCount((prev) => prev + 1);
              setTimeout(() => {
                if (currentFileRef.current) {
                  handleUpload(currentFileRef.current);
                }
              }, 2000 * (retryCount + 1));
            } else {
              throw new Error(errorMsg);
            }
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
    [memberId, onError, onUploadComplete, retryCount, maxRetries]
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
    setUploadProgress(0);
  }, []);

  if (isUploading) {
    return (
      <UploadProgress
        progress={uploadProgress}
        onCancel={cancelUpload}
        success={uploadSuccess}
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
