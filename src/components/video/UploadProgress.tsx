"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { Progress, Button } from "@nextui-org/react";
import { X } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
  success: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  onCancel,
}) => {
  const [displayProgress, setDisplayProgress] = useState<number>(0);

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  const getStatusMessage = useCallback((): string => {
    if (displayProgress < 100) return "מעלה את הסרטון שלך...";
    return "מעבד את הסרטון...";
  }, [displayProgress]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

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
        <span className="text-sm font-medium">מעלה סרטון</span>
        <Button
          size="sm"
          isIconOnly
          variant="light"
          onPress={handleCancel}
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
      <p className="text-xs text-gray-500 mt-1">{getStatusMessage()}</p>
    </div>
  );
};

export default memo(UploadProgress);
