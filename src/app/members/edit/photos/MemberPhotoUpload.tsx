"use client";

import { addImage } from "@/app/actions/userActions";
import ImageButtonUpload from "@/components/ImageButtonUpload";
import { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";

export default function MemberPhotoUpload() {
  const router = useRouter();
  const onAddImage = async (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === "object") {
      await addImage(result.info.secure_url, result.info.public_id);
      router.refresh();
      toast.success("התמונה הועלתה בהצלחה", {
        style: getToastStyle(),
      });
    } else {
      toast.error("בעיה בהעלאת התמונה", {
        style: getToastStyle(),
      });
    }
  };

  return (
    <div className="flex justify-end">
      <ImageButtonUpload onUploadImage={onAddImage} />
    </div>
  );
}
