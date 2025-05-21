"use client";

import React from "react";
import { Button } from "@nextui-org/react";
import { VideoIcon, RefreshCw, Trash2 } from "lucide-react";
import AppModal from "@/components/AppModal";
import VideoPlayer from "@/components/video/VideoPlayer";

interface VideoManagerActionsProps {
  videoUrl: string;
  createdAt?: string | null;
  onReplace: () => void;
  onDelete: () => void;
  isVideoModalOpen: boolean;
  setVideoModalOpen: (open: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
}

export default function VideoManagerActions({
  videoUrl,
  createdAt,
  onReplace,
  onDelete,
  isVideoModalOpen,
  setVideoModalOpen,
  isDeleteModalOpen,
  setDeleteModalOpen,
}: VideoManagerActionsProps) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  };

  return (
    <div className="text-center">
      <Button
        onPress={() => setVideoModalOpen(true)}
        variant="solid"
        className="bg-amber-500 text-white rounded-full mb-3"
        startContent={<VideoIcon size={16} />}
      >
        הצג את הסרטון שלי
      </Button>

      {createdAt && (
        <p className="text-xs text-neutral-500 mb-2">
          הועלה ב־{formatDate(createdAt)}
        </p>
      )}

      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="light"
          onPress={onReplace}
          startContent={<RefreshCw size={16} />}
          className="text-amber-600 hover:text-amber-700"
        >
          החלף סרטון
        </Button>
        <Button
          size="sm"
          variant="light"
          color="danger"
          onPress={() => setDeleteModalOpen(true)}
          startContent={<Trash2 size={16} />}
        >
          מחק
        </Button>
      </div>

      <AppModal
        isOpen={isVideoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        header="הסרטון שלך"
        imageModal
        size="2xl"
        body={
          <div className="animate-fadeInSlow">
            <VideoPlayer
              url={videoUrl}
              aspectRatio="video"
              autoPlay={false}
              loop
              muted={false}
            />
          </div>
        }
      />

      <AppModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        header="מחיקת סרטון"
        body={
          <p className="text-center">
            האם אתה בטוח שברצונך למחוק את הסרטון שלך?
          </p>
        }
        footerButtons={[
          {
            children: "ביטול",
            variant: "light",
            onPress: () => setDeleteModalOpen(false),
          },
          {
            children: "מחק",
            color: "danger",
            onPress: onDelete,
          },
        ]}
      />
    </div>
  );
}
