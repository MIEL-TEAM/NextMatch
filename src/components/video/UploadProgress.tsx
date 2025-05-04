"use client";

import React, { memo } from "react";
import { Progress, Button } from "@nextui-org/react";
import { X, Check } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
  success: boolean;
  isCompressing?: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = memo(
  ({ progress, onCancel, success, isCompressing = false }) => {
    const progressLabel = isCompressing
      ? "דחיסת סרטון"
      : progress < 100
      ? "העלאת סרטון"
      : "עיבוד סרטון";

    const statusText = isCompressing
      ? "מדחיס את הסרטון..."
      : progress < 100
      ? "מעלה סרטון..."
      : "מעבד סרטון...";

    if (success) {
      return (
        <div
          className="flex items-center justify-center bg-green-100 text-green-700 p-4 rounded-lg animate-fadeIn"
          dir="rtl"
          role="alert"
          aria-live="polite"
        >
          <Check size={20} className="ml-2" aria-hidden="true" />
          <span>ההעלאה הושלמה בהצלחה!</span>
        </div>
      );
    }

    return (
      <section
        className="border rounded-lg p-4 bg-white shadow-sm"
        dir="rtl"
        aria-label={progressLabel}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{progressLabel}</h3>
          <Button
            size="sm"
            isIconOnly
            variant="light"
            onPress={onCancel}
            aria-label="ביטול העלאה"
            className="focus:ring-2 focus:ring-blue-500"
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>

        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <Progress
            value={progress}
            color={progress < 100 ? "primary" : "success"}
            className="mb-2"
            showValueLabel={true}
            valueLabel={`${progress}%`}
            aria-hidden="true"
          />
        </div>

        <p className="text-xs text-gray-500" aria-live="polite">
          {statusText}
        </p>
      </section>
    );
  }
);

UploadProgress.displayName = "UploadProgress";

export default UploadProgress;
