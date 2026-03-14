"use client";

import React, { useState } from "react";
import VideoUploader from "@/components/video/VideoUpload";
import UploadStatusView from "@/components/video/UploadStatusView";
import VideoManagerActions from "@/components/video/VideoManagerActions";
import { toast } from "sonner";
import { Button, Spinner } from "@nextui-org/react";
import { VideoUploadSectionProps, VideoState } from "@/types/video";

export default function VideoUploadSection({
  memberId,
  existingVideos = [],
}: VideoUploadSectionProps) {
  const [state, setState] = useState<VideoState>({
    videos: existingVideos,
    videoUrl: existingVideos.length ? existingVideos[0].url : null,
    createdAt: existingVideos.length ? existingVideos[0].createdAt || null : null,
    currentVideoId: existingVideos.length ? existingVideos[0].id : null,
    isReplacing: false,
    isVideoModalOpen: false,
    isDeleteModalOpen: false,
    justUploaded: false,
    justDeleted: false,
    isDeleting: false,
  });

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

      setState((prev) => ({
        ...prev,
        videoUrl: fileUrl,
        createdAt: now,
        currentVideoId: data.videoId,
        videos: [{ url: fileUrl, id: data.videoId, createdAt: now }],
        isReplacing: false,
        justUploaded: true,
      }));
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
    setState((prev) => ({ ...prev, isDeleting: true }));
    try {
      const response = await fetch(
        `/api/videos/delete?videoId=${state.currentVideoId}&memberId=${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete video");

      setState((prev) => ({
        ...prev,
        videoUrl: null,
        currentVideoId: null,
        videos: [],
        justDeleted: true,
        isDeleteModalOpen: false,
      }));
      toast.success("הסרטון נמחק בהצלחה");
    } catch (error) {
      console.error(error);
      toast.error("שגיאה במחיקת הסרטון");
    } finally {
      setState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  if (state.justUploaded || state.justDeleted) {
    return (
      <UploadStatusView
        status={state.justUploaded ? "uploaded" : "deleted"}
        onReset={() =>
          setState((prev) => ({ ...prev, justUploaded: false, justDeleted: false }))
        }
      />
    );
  }

  if (state.videoUrl && !state.isReplacing) {
    return (
      <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-white shadow-sm text-center">
        <h3 className="text-lg font-semibold text-amber-600 mb-2">
          הסרטון שלך
        </h3>

        {state.isDeleting ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Spinner color="warning" size="md" />
            <p className="text-amber-600 mt-2">מוחק...</p>
          </div>
        ) : (
          <VideoManagerActions
            videoUrl={state.videoUrl}
            createdAt={state.createdAt}
            onReplace={() => setState((prev) => ({ ...prev, isReplacing: true }))}
            onDelete={handleDeleteVideo}
            isVideoModalOpen={state.isVideoModalOpen}
            setVideoModalOpen={(v: boolean) =>
              setState((prev) => ({ ...prev, isVideoModalOpen: v }))
            }
            isDeleteModalOpen={state.isDeleteModalOpen}
            setDeleteModalOpen={(v: boolean) =>
              setState((prev) => ({ ...prev, isDeleteModalOpen: v }))
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border border-dashed border-amber-300 rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-amber-600">
        {state.isReplacing ? "החלף את הסרטון שלך" : "העלה סרטון לפרופיל שלך"}
      </h3>
      <p className="text-sm text-neutral-600 mb-4">
        סרטון קצר שלך יעזור לאחרים להכיר אותך טוב יותר.
      </p>
      <VideoUploader
        memberId={memberId}
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />
      {state.isReplacing && (
        <Button
          className="mt-3"
          variant="light"
          onPress={() => setState((prev) => ({ ...prev, isReplacing: false }))}
        >
          ביטול
        </Button>
      )}
    </div>
  );
}
