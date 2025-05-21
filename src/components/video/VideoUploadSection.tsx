"use client";

import React, { useState } from "react";
import VideoUploader from "@/components/video/VideoUpload";
import UploadStatusView from "@/components/video/UploadStatusView";
import VideoManagerActions from "@/components/video/VideoManagerActions";
import { toast } from "sonner";
import { Button, Spinner } from "@nextui-org/react";

interface VideoUploadSectionProps {
  memberId: string;
  existingVideos?: Array<{ url: string; id: string; createdAt?: string }>;
}

export default function VideoUploadSection({
  memberId,
  existingVideos = [],
}: VideoUploadSectionProps) {
  const [videos, setVideos] = useState(existingVideos);
  const [videoUrl, setVideoUrl] = useState<string | null>(
    videos.length > 0 ? videos[0].url : null
  );
  const [createdAt, setCreatedAt] = useState<string | null>(
    videos.length > 0 ? videos[0].createdAt || null : null
  );
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(
    videos.length > 0 ? videos[0].id : null
  );

  const [isReplacing, setIsReplacing] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const [justDeleted, setJustDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUploadComplete = async (fileUrl: string) => {
    try {
      const response = await fetch("/api/videos/save-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, videoUrl: fileUrl }),
      });

      if (!response.ok) throw new Error("Failed to save video");

      const data = await response.json();
      const now = new Date().toISOString();

      setVideoUrl(fileUrl);
      setCreatedAt(now);
      setCurrentVideoId(data.videoId);
      setVideos([{ url: fileUrl, id: data.videoId, createdAt: now }]);
      setIsReplacing(false);
      setJustUploaded(true);
      toast.success("הסרטון הועלה בהצלחה! 🎉");
    } catch (error) {
      console.error(error);
      toast.error("שגיאה בשמירת הסרטון");
    }
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const handleDeleteVideo = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/videos/delete?videoId=${currentVideoId}&memberId=${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete video");

      setVideoUrl(null);
      setCurrentVideoId(null);
      setVideos([]);
      setJustDeleted(true);
      setIsDeleteModalOpen(false);
      toast.success("הסרטון נמחק בהצלחה");
    } catch (error) {
      console.error(error);
      toast.error("שגיאה במחיקת הסרטון");
    } finally {
      setIsDeleting(false);
    }
  };

  if (justUploaded || justDeleted) {
    return (
      <UploadStatusView
        status={justUploaded ? "uploaded" : "deleted"}
        onReset={() => {
          setJustUploaded(false);
          setJustDeleted(false);
        }}
      />
    );
  }

  if (videoUrl && !isReplacing) {
    return (
      <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-white shadow-sm text-center">
        <h3 className="text-lg font-semibold text-amber-600 mb-2">
          הסרטון שלך
        </h3>

        {isDeleting ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Spinner color="warning" size="md" />
            <p className="text-amber-600 mt-2">מוחק...</p>
          </div>
        ) : (
          <VideoManagerActions
            videoUrl={videoUrl}
            createdAt={createdAt}
            onReplace={() => setIsReplacing(true)}
            onDelete={handleDeleteVideo}
            isVideoModalOpen={isVideoModalOpen}
            setVideoModalOpen={setIsVideoModalOpen}
            isDeleteModalOpen={isDeleteModalOpen}
            setDeleteModalOpen={setIsDeleteModalOpen}
          />
        )}
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
