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
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  memberId,
  onUploadComplete,
  onError,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    const fileType = file.type.toLowerCase();
    const fileSize = file.size;
    const maxSizeMB = Math.floor(VIDEO_UPLOAD_CONFIG.maxFileSize / 1024 / 1024);

    if (fileSize > VIDEO_UPLOAD_CONFIG.maxFileSize) {
      return `הקובץ גדול מדי (${(fileSize / 1024 / 1024).toFixed(
        1
      )} מ״ב). הגודל המקסימלי המותר הוא ${maxSizeMB} מ״ב`;
    }

    if (!VIDEO_UPLOAD_CONFIG.allowedTypes.includes(fileType as any)) {
      return `סוג הקובץ ${fileType} אינו נתמך. נתמכים רק קבצי MP4, MOV או AVI`;
    }

    return null;
  }, []);

  // Server-based upload using FormData
  const handleServerUpload = useCallback(
    async (file: File) => {
      const errorMessage = validateFile(file);
      if (errorMessage) {
        onError(errorMessage);
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadSuccess(false);

        // Create form data
        const formData = new FormData();
        formData.append("file", file);
        formData.append("memberId", memberId);

        // Create XHR request to track progress
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        // Handle completion
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload success response:", response);
              setUploadSuccess(true);
              setTimeout(onUploadComplete, 1500);
            } catch (e) {
              console.error("Error parsing response:", e);
              onError("ההעלאה הושלמה אך התגובה לא תקינה");
            }
          } else {
            console.error("Upload failed with status:", xhr.status);
            onError(`ההעלאה נכשלה: ${xhr.status}`);
          }
          setIsUploading(false);
        };

        // Handle errors
        xhr.onerror = () => {
          console.error("Network error during upload");
          onError("שגיאת רשת בעת העלאה");
          setIsUploading(false);
        };

        // Send request
        xhr.open("POST", "/api/videos/upload", true);
        xhr.send(formData);
      } catch (error) {
        console.error("Upload error:", error);
        onError(error instanceof Error ? error.message : "שגיאה לא ידועה");
        setIsUploading(false);
      }
    },
    [memberId, onError, onUploadComplete, validateFile]
  );

  // Drag event handlers
  const handleDrag = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Drop handler
  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleServerUpload(e.dataTransfer.files[0]);
      }
    },
    [handleServerUpload]
  );

  // File input button click handler
  const onButtonClick = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  // File input change handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.files && e.target.files[0]) {
        handleServerUpload(e.target.files[0]);
      }
    },
    [handleServerUpload]
  );

  // Upload cancel handler
  const cancelUpload = useCallback((): void => {
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
