"use client";

import React, { useReducer, useRef, useCallback, useEffect } from "react";
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

interface UploaderState {
  isUploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
  retryCount: number;
  currentFile: File | null;
}

type UploaderAction =
  | { type: "START_UPLOAD"; payload: File }
  | { type: "SET_PROGRESS"; payload: number }
  | { type: "UPLOAD_SUCCESS" }
  | { type: "UPLOAD_FAILURE" }
  | { type: "INCREMENT_RETRY" }
  | { type: "RESET_RETRY" }
  | { type: "CANCEL_UPLOAD" };

const initialUploaderState: UploaderState = {
  isUploading: false,
  uploadProgress: 0,
  uploadSuccess: false,
  retryCount: 0,
  currentFile: null,
};

const uploaderReducer = (
  state: UploaderState,
  action: UploaderAction
): UploaderState => {
  switch (action.type) {
    case "START_UPLOAD":
      return {
        ...state,
        isUploading: true,
        uploadProgress: 0,
        uploadSuccess: false,
        currentFile: action.payload,
      };
    case "SET_PROGRESS":
      return {
        ...state,
        uploadProgress: action.payload,
      };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        uploadSuccess: true,
      };
    case "UPLOAD_FAILURE":
      return {
        ...state,
        isUploading: false,
      };
    case "INCREMENT_RETRY":
      return {
        ...state,
        retryCount: state.retryCount + 1,
      };
    case "RESET_RETRY":
      return {
        ...state,
        retryCount: 0,
      };
    case "CANCEL_UPLOAD":
      return {
        ...state,
        isUploading: false,
        uploadProgress: 0,
        currentFile: null,
      };
    default:
      return state;
  }
};

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  memberId,
  onUploadComplete,
  onError,
  maxRetries = 3,
}) => {
  const [state, dispatch] = useReducer(uploaderReducer, initialUploaderState);
  const { compressVideo, isCompressing, compressionProgress } =
    useVideoCompression();
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    let successTimeout: NodeJS.Timeout;

    if (state.uploadSuccess) {
      successTimeout = setTimeout(() => {
        onUploadComplete();
      }, 1500);
    }

    return () => {
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, [state.uploadSuccess, onUploadComplete]);

  const uploadToServer = useCallback(
    async (fileToUpload: File): Promise<void> => {
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
            dispatch({ type: "SET_PROGRESS", payload: progress });
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

        xhr.onerror = () =>
          reject(new Error("שגיאת תקשורת. בדוק את החיבור לאינטרנט ונסה שוב"));
        xhr.ontimeout = () =>
          reject(new Error("פעולת ההעלאה ארכה זמן רב מדי. נסה שוב מאוחר יותר"));
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
        dispatch({ type: "START_UPLOAD", payload: file });

        let fileToUpload = file;
        if (file.size > 7 * 1024 * 1024) {
          try {
            fileToUpload = await compressVideo(file);
            dispatch({ type: "SET_PROGRESS", payload: 0 });
          } catch (error) {
            console.error("Video compression failed:", error);
          }
        }

        await uploadToServer(fileToUpload);
        dispatch({ type: "UPLOAD_SUCCESS" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "ההעלאה נכשלה";

        if (state.retryCount < maxRetries) {
          dispatch({ type: "INCREMENT_RETRY" });

          setTimeout(() => {
            if (state.currentFile) {
              handleUpload(state.currentFile);
            }
          }, 2000 * (state.retryCount + 1));
          return;
        }

        onError(errorMessage);
        dispatch({ type: "UPLOAD_FAILURE" });
        dispatch({ type: "RESET_RETRY" });
      }
    },
    [
      compressVideo,
      uploadToServer,
      onError,
      state.retryCount,
      state.currentFile,
      maxRetries,
    ]
  );

  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    dispatch({ type: "CANCEL_UPLOAD" });
  }, []);

  if (state.isUploading) {
    return (
      <UploadProgress
        progress={isCompressing ? compressionProgress : state.uploadProgress}
        onCancel={cancelUpload}
        success={state.uploadSuccess}
        isCompressing={isCompressing}
      />
    );
  }

  return <DragDropUpload onFileSelected={handleUpload} />;
};

export default VideoUploader;
