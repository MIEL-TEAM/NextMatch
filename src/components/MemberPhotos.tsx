"use client";

import { deleteImage, setMainImage } from "@/app/actions/userActions";
import { Photo } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import MemberImage from "./MemberImage";
import StarButton from "./StarButton";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";

type MemberPhotosProps = {
  photos: Photo[] | null;
  editing?: boolean;
  mainImageUrl?: string | null;
};

export default function MemberPhotos({
  photos,
  editing,
  mainImageUrl,
}: MemberPhotosProps) {
  const router = useRouter();
  const [loading, setIsLoading] = useState({
    type: "",
    isLoading: false,
    id: "",
  });

  const onSetMain = async (photo: Photo) => {
    if (photo.url === mainImageUrl) return null;
    setIsLoading({ isLoading: true, id: photo.id, type: "main" });

    try {
      await setMainImage(photo);
      router.refresh();
      toast.success("תמונת הפרופיל עודכנה בהצלחה", {
        style: getToastStyle(),
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading({ isLoading: false, id: "", type: "" });
    }
  };

  const onDelete = async (photo: Photo) => {
    if (photo.url === mainImageUrl) return null;
    setIsLoading({ isLoading: true, id: photo.id, type: "delete" });

    try {
      await deleteImage(photo);
      router.refresh();
      toast.success("התמונה נמחקה בהצלחה", {
        style: getToastStyle(),
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading({ isLoading: false, id: "", type: "" });
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {photos &&
        photos.map((photo, index) => (
          <div key={photo.id} className="relative aspect-square">
            <MemberImage photo={photo} isPriority={index === 0} />
            {editing && (
              <>
                <div
                  onClick={() => onSetMain(photo)}
                  className="absolute top-2 left-2 z-50 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <StarButton
                    selected={photo.url === mainImageUrl}
                    loading={
                      loading.isLoading &&
                      loading.type === "main" &&
                      loading.id === photo.id
                    }
                  />
                </div>
                <div
                  onClick={() => onDelete(photo)}
                  className="absolute top-2 right-2 z-50 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <DeleteButton
                    loading={
                      loading.isLoading &&
                      loading.type === "delete" &&
                      loading.id === photo.id
                    }
                  />
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
}
