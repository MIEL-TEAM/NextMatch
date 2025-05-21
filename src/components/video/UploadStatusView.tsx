"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { CheckCircle2 } from "lucide-react";

interface UploadStatusViewProps {
  status: "uploaded" | "deleted";
  onReset: () => void;
}

export default function UploadStatusView({
  status,
  onReset,
}: UploadStatusViewProps) {
  const isUpload = status === "uploaded";
  return (
    <div className="p-4 border border-green-200 rounded-xl bg-green-50 text-center text-green-800 animate-fadeIn">
      <div className="flex justify-center items-center gap-2 mb-2">
        <CheckCircle2 size={20} />
        <p className="text-sm font-medium">
          הסרטון {isUpload ? "הועלה" : "נמחק"} בהצלחה ✔
        </p>
      </div>
      <Button className="mt-2" variant="solid" onPress={onReset}>
        {isUpload ? "המשך" : "העלה סרטון חדש"}
      </Button>
    </div>
  );
}
