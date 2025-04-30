"use client";

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@nextui-org/react";
import { Upload, VideoIcon } from "lucide-react";
import { VIDEO_UPLOAD_CONFIG } from "@/lib/aws-config";

interface DragDropUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled) return;

      if (event.type === "dragenter" || event.type === "dragover") {
        setDragActive(true);
      } else if (event.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelected(e.dataTransfer.files[0]);
      }
    },
    [onFileSelected, disabled]
  );

  const onButtonClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileSelected(e.target.files[0]);
      }
    },
    [onFileSelected]
  );

  const maxSizeMB = Math.floor(VIDEO_UPLOAD_CONFIG.maxFileSize / 1024 / 1024);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-all ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
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
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
          onPress={onButtonClick}
          isDisabled={disabled}
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
          disabled={disabled}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default DragDropUpload;
