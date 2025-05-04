"use client";

import React, { useReducer, useRef, useCallback, memo } from "react";
import { Button } from "@nextui-org/react";
import { Upload, VideoIcon } from "lucide-react";
import { VIDEO_UPLOAD_CONFIG } from "@/lib/aws-config";

interface DragDropUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

interface DragDropState {
  dragActive: boolean;
}

type DragDropAction = { type: "SET_DRAG_ACTIVE"; payload: boolean };

const dragDropReducer = (
  state: DragDropState,
  action: DragDropAction
): DragDropState => {
  switch (action.type) {
    case "SET_DRAG_ACTIVE":
      return { dragActive: action.payload };
    default:
      return state;
  }
};

const DragDropUpload: React.FC<DragDropUploadProps> = memo(
  ({ onFileSelected, disabled = false }) => {
    const [state, dispatch] = useReducer(dragDropReducer, {
      dragActive: false,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) return;

        const isDragActive =
          event.type === "dragenter" || event.type === "dragover";
        dispatch({ type: "SET_DRAG_ACTIVE", payload: isDragActive });
      },
      [disabled]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: "SET_DRAG_ACTIVE", payload: false });

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
    const allowedFormats = "MP4, MOV או AVI";

    return (
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          state.dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        dir="rtl"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`אזור העלאת וידאו. ${
          state.dragActive
            ? "שחרר את הסרטון כאן"
            : "גרור ושחרר סרטון כאן או לחץ לבחירת קובץ"
        }`}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            onButtonClick();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="bg-blue-100 p-4 rounded-full">
            <VideoIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium">
              {state.dragActive
                ? "שחרר את הסרטון כאן"
                : "גרור ושחרר את הסרטון כאן"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {allowedFormats} (מקסימום {maxSizeMB} מגה-בייט)
            </p>

            <p className="text-xs text-gray-500 mt-1">
              סרטונים גדולים יעברו דחיסה אוטומטית
            </p>
          </div>

          <Button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500"
            onPress={onButtonClick}
            isDisabled={disabled}
            startContent={<Upload size={16} aria-hidden="true" />}
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
  }
);

DragDropUpload.displayName = "DragDropUpload";

export default DragDropUpload;
