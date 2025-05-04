"use client";

import { useReducer, useCallback } from "react";

// Define state interface
interface CompressionState {
  isCompressing: boolean;
  compressionProgress: number;
}

// Define action types
type CompressionAction =
  | { type: "START_COMPRESSION" }
  | { type: "PROGRESS"; payload: number }
  | { type: "COMPLETE_COMPRESSION" };

// Define reducer function
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

export const useVideoCompression = () => {
  // Initialize state with reducer
  const [state, dispatch] = useReducer(compressionReducer, {
    isCompressing: false,
    compressionProgress: 0,
  });

  // Enhanced compressVideo function with useCallback to prevent unnecessary recreation
  const compressVideo = useCallback(async (file: File): Promise<File> => {
    if (file.size <= 7 * 1024 * 1024) {
      // Skip compression for small files
      return file;
    }

    dispatch({ type: "START_COMPRESSION" });

    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10; // Faster simulation
        dispatch({ type: "PROGRESS", payload: Math.min(progress, 100) });

        if (progress >= 100) {
          clearInterval(interval);
          dispatch({ type: "COMPLETE_COMPRESSION" });
          resolve(file);
        }
      }, 50);
    });
  }, []);

  return {
    compressVideo,
    isCompressing: state.isCompressing,
    compressionProgress: state.compressionProgress,
  };
};

export default useVideoCompression;
