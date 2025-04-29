"use client";

import React, { useEffect, useState } from "react";
import { Progress, Button } from "@nextui-org/react";
import { X, Check } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
  success: boolean;
  isCompressing?: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  onCancel,
  success,
  isCompressing = false,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (Math.abs(progress - displayProgress) < 3) {
      setDisplayProgress(progress);
      return;
    }

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev === progress) return prev;

        const diff = progress - prev;
        const increment = Math.sign(diff) * Math.min(Math.abs(diff), 2);
        return prev + increment;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [progress, displayProgress]);

  if (success) {
    return (
      <div
        className="flex items-center justify-center bg-green-100 text-green-700 p-4 rounded-lg animate-fadeIn"
        dir="rtl"
        role="alert"
        aria-live="polite"
      >
        <Check size={20} className="ml-2" />
        <span>ההעלאה הושלמה בהצלחה!</span>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (isCompressing) return "מדחיס את הסרטון...";
    if (displayProgress < 100) return "מעלה סרטון...";
    return "מעבד סרטון...";
  };

  return (
    <div
      className="border rounded-lg p-4 bg-white shadow-sm"
      dir="rtl"
      role="progressbar"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">
          {isCompressing ? "דחיסת סרטון" : "העלאת סרטון"}
        </span>
        <Button
          size="sm"
          isIconOnly
          variant="light"
          onPress={onCancel}
          aria-label="ביטול העלאה"
          className="focus:ring-2 focus:ring-blue-500"
        >
          <X size={16} />
        </Button>
      </div>
      <Progress
        value={displayProgress}
        color={displayProgress < 100 ? "primary" : "success"}
        className="mb-2"
        showValueLabel={true}
        valueLabel={`${displayProgress}%`}
        aria-label="התקדמות העלאה"
      />
      <p className="text-xs text-gray-500">{getStatusMessage()}</p>
    </div>
  );
};

export default UploadProgress;
