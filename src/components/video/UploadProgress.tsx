"use client";

import React, { useEffect, useState, useCallback, memo } from "react";
import { Progress, Button } from "@nextui-org/react";
import { X, Check, Video } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
  success: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  onCancel,
  success,
}) => {
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const getStatusMessage = useCallback((): string => {
    if (displayProgress < 100) return "מעלה את הסרטון שלך...";
    return "מעבד את הסרטון...";
  }, [displayProgress]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (showSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-green-800 flex flex-col gap-2 animate-fadeIn shadow-sm relative">
        <button
          onClick={() => setShowSuccess(false)}
          className="absolute top-2 right-2 text-green-600 hover:text-green-800 transition-colors"
          aria-label="סגור"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Check size={20} />
          <span className="font-medium">ההעלאה הושלמה בהצלחה!</span>
        </div>
        <div className="text-sm text-green-700 leading-snug">
          הסרטון נוסף לפרופיל שלך.
          <br />
          ניתן לצפות בו עכשיו בתחתית העמוד, או לחזור מאוחר יותר לבדוק.
        </div>
        <Button
          onPress={() =>
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            })
          }
          className="bg-green-600 text-white hover:bg-green-700 w-fit mt-3"
          startContent={<Video size={16} />}
        >
          גלול לסרטון
        </Button>
      </div>
    );
  }

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
