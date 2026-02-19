"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import {
  CldUploadButton,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { updateCoverImage, removeCoverImage } from "@/app/actions/userActions";
import { toast } from "react-toastify";

import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";

type CoverImageUploadProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCoverImage?: string | null;
  onSuccess?: () => void;
};

export default function CoverImageUpload({
  isOpen,
  onClose,
  currentCoverImage,
  onSuccess,
}: CoverImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = async (result: CloudinaryUploadWidgetResults) => {
    setLoading(true);
    try {
      if (result.info && typeof result.info !== "string") {
        const url = result.info.secure_url;
        const publicId = result.info.public_id;

        await updateCoverImage(url, publicId);

        toast.success("תמונת הכיסוי עודכנה בהצלחה!");

        onSuccess?.();
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast.error("שגיאה בהעלאת תמונת הכיסוי");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCover = async () => {
    setLoading(true);
    try {
      await removeCoverImage();

      toast.success("תמונת הכיסוי הוסרה בהצלחה");

      onSuccess?.();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error removing cover image:", error);
      toast.error("שגיאה בהסרת תמונת הכיסוי");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" dir="rtl">
      <ModalContent>
        <ModalHeader>עדכן תמונת כיסוי</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {currentCoverImage && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={currentCoverImage}
                  alt="Current cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-sm text-gray-600">
              תמונת הכיסוי תופיע בראש הפרופיל שלך. בחר תמונה אופקית לתוצאות
              הטובות ביותר.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex gap-2 w-full">
            {currentCoverImage && (
              <Button
                color="danger"
                variant="flat"
                onPress={handleRemoveCover}
                isLoading={loading}
                startContent={!loading && <Trash2 size={18} />}
              >
                הסר תמונה
              </Button>
            )}
            <CldUploadButton
              options={{
                maxFiles: 1,
                language: "he",
                uploadPreset: "nm-demo",
                folder: "user_uploads",
                cropping: true,
                croppingAspectRatio: 2.5,
                sources: ["local", "camera"],
                multiple: false,
                singleUploadAutoClose: true,
                text: {
                  he: {
                    menu: {
                      files: "תמונה חדשה",
                      camera: "צילום ממצלמה",
                    },
                    local: {
                      browse: "בחר תמונה",
                      dd_title_single: "גרור ושחרר את התמונה כאן",
                    },
                    actions: {
                      upload: "העלה עכשיו",
                      cancel: "ביטול",
                    },
                    or: "או",
                    back: "חזור",
                    close: "סגור",
                  },
                },
              }}
              onSuccess={handleUploadSuccess}
              signatureEndpoint="/api/sign-image"
              uploadPreset="nm-demo"
              className="flex-1"
            >
              <Button
                color="primary"
                className="w-full"
                isLoading={loading}
                startContent={!loading && <Camera size={18} />}
              >
                {currentCoverImage ? "שנה תמונה" : "העלה תמונה"}
              </Button>
            </CldUploadButton>
            <Button color="default" variant="light" onPress={onClose}>
              ביטול
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
