"use client";

import { addImage } from "@/app/actions/userActions";
import ImageButtonUpload from "@/components/ImageButtonUpload";
import { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

export default function MemberPhotoUpload() {
  const router = useRouter();
  const onAddImage = async (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info !== "string") {
      try {
        const imageId = result.info.public_id;
        const imageUrl = result.info.secure_url;
        await addImage(imageUrl, imageId);
        toast.success("התמונה נוספה בהצלחה, המתן לאישור");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message);
      }
    } else {
      toast.error("שגיאה בהעלאת התמונה");
    }
  };

  return (
    <div className="flex justify-end">
      <ImageButtonUpload onUploadImage={onAddImage} />
    </div>
  );
}
