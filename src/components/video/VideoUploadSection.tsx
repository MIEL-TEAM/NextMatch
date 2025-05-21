"use client";

import React, { useState } from "react";
import VideoUploader from "@/components/video/VideoUpload";
import VideoPlayer from "@/components/video/VideoPlayer";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { RefreshCw, Trash2 } from "lucide-react";

interface VideoUploadSectionProps {
  memberId: string;
  existingVideos?: Array<{ url: string; id: string }>;
}

export default function VideoUploadSection({
  memberId,
  existingVideos = [],
}: VideoUploadSectionProps) {
  const [videos, setVideos] = useState(existingVideos);
  const [videoUrl, setVideoUrl] = useState<string | null>(
    videos.length > 0 ? videos[0].url : null
  );
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(
    videos.length > 0 ? videos[0].id : null
  );
  const [isReplacing, setIsReplacing] = useState(false);

  const handleUploadComplete = async (fileUrl: string) => {
    try {
      const response = await fetch("/api/videos/save-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          videoUrl: fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save video");
      }

      const data = await response.json();
      setVideoUrl(fileUrl);
      setCurrentVideoId(data.videoId);
      setVideos([{ url: fileUrl, id: data.videoId }]);
      setIsReplacing(false);
      toast.success("הסרטון הועלה בהצלחה! 🎉");
    } catch (error) {
      console.error("Error saving video:", error);
      toast.error("שגיאה בשמירת הסרטון");
    }
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const handleDeleteVideo = async () => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הסרטון?")) return;

    try {
      const response = await fetch(
        `/api/videos/delete?videoId=${currentVideoId}&memberId=${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      setVideoUrl(null);
      setCurrentVideoId(null);
      setVideos([]);
      toast.success("הסרטון נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("שגיאה במחיקת הסרטון");
    }
  };

  if (videoUrl && !isReplacing) {
    return (
      <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-amber-600">הסרטון שלך</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() => setIsReplacing(true)}
              startContent={<RefreshCw size={16} />}
              className="text-amber-600 hover:text-amber-700"
            >
              החלף סרטון
            </Button>
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={handleDeleteVideo}
              startContent={<Trash2 size={16} />}
            >
              מחק
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden shadow-md">
          <VideoPlayer
            url={videoUrl}
            aspectRatio="video"
            autoPlay={false}
            loop={true}
            muted={false}
          />
        </div>

        <p className="text-sm text-neutral-600 mt-3 text-center">
          הסרטון שלך זמין כעת בפרופיל ובעמוד החברים! 🎬
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-amber-600">
        {isReplacing ? "החלף את הסרטון שלך" : "העלה סרטון לפרופיל שלך"}
      </h3>
      <p className="text-sm text-neutral-600 mb-4">
        סרטון קצר שלך יעזור לאחרים להכיר אותך טוב יותר.
      </p>
      <VideoUploader
        memberId={memberId}
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />
      {isReplacing && (
        <Button
          className="mt-3"
          variant="light"
          onPress={() => setIsReplacing(false)}
        >
          ביטול
        </Button>
      )}
    </div>
  );
}
