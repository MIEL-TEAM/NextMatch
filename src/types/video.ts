export interface VideoUploadSectionProps {
    memberId: string;
    existingVideos?: Array<{ url: string; id: string; createdAt?: string }>;
  }
  
  export type VideoState = {
    videos: Array<{ url: string; id: string; createdAt?: string }>;
    videoUrl: string | null;
    createdAt: string | null;
    currentVideoId: string | null;
    isReplacing: boolean;
    isVideoModalOpen: boolean;
    isDeleteModalOpen: boolean;
    justUploaded: boolean;
    justDeleted: boolean;
    isDeleting: boolean;
  };