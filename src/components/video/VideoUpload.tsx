"use client";

import React, { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { Upload, VideoIcon } from "lucide-react";
import UploadProgress from "./UploadProgress";

interface VideoUploaderProps {
  memberId: string;
  onUploadComplete: (videoUrl: string) => void;
  onError: (message: string) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  memberId,
  onUploadComplete,
  onError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadFileWithProgress = (url: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded * 100) / event.total
          );
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadSuccess(false);

      const res = await fetch("/api/videos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          memberId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, fileUrl } = await res.json();

      await uploadFileWithProgress(uploadUrl, file);

      setUploadSuccess(true);

      onUploadComplete(fileUrl);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSuccess(false);
        resetFileInput();
      }, 10000);
    } catch (err: any) {
      console.error(err);
      onError(err.message || "שגיאה בהעלאה. ודא שהקובץ תקין.");
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSuccess(false);
    }
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return isUploading ? (
    <UploadProgress
      progress={uploadProgress}
      onCancel={handleCancel}
      success={uploadSuccess}
    />
  ) : (
    <div className="border-2 border-dashed p-6 rounded-lg text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="bg-blue-100 p-4 rounded-full">
          <VideoIcon className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-sm">גרור ושחרר סרטון או לחץ לבחור קובץ</p>
        <Button
          onPress={() => fileInputRef.current?.click()}
          startContent={<Upload size={16} />}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          בחר סרטון
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default VideoUploader;
