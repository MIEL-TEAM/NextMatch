"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import {
  CldUploadButton,
  CloudinaryUploadWidgetOptions,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { HiPhoto } from "react-icons/hi2";
import { Progress } from "@nextui-org/react";
import { IoMdCloseCircle } from "react-icons/io";
import Image from "next/image";

export default function PhotoUploadForm() {
  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const [photos, setPhotos] = useState<{ url: string; publicId: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const photosRef = useRef<{ url: string; publicId: string }[]>([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    const initialPhotos = getValues("photos") || [];
    if (initialPhotos.length > 0) {
      setPhotos(initialPhotos);
    }
  }, [getValues]);

  const onUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    setUploadError(null);

    if (result.info && typeof result.info === "object") {
      const currentPhotos = [...photosRef.current];

      if (currentPhotos.length < 3) {
        const isAppropriate = true;

        if (!isAppropriate) {
          setUploadError(
            "התמונה לא מתאימה למדיניות האתר. נא להעלות תמונה אחרת."
          );
          setUploading(false);
          return;
        }

        const newPhoto = {
          url: result.info.secure_url as string,
          publicId: result.info.public_id as string,
        };

        const updatedPhotos = [...currentPhotos, newPhoto];

        setPhotos(updatedPhotos);
        setValue("photos", updatedPhotos, { shouldValidate: true });
      }
    }

    setUploading(false);
  };

  const onUploadError = (error: any) => {
    console.log(error);

    setUploadError("שגיאה בהעלאת התמונה. נסה שוב.");
    setUploading(false);
  };

  const removePhoto = (indexToRemove: number) => {
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);
    setValue("photos", updatedPhotos, { shouldValidate: true });
  };

  const cloudinaryOptions: CloudinaryUploadWidgetOptions = {
    maxFiles: 1,
    multiple: false,
    cropping: true,
    sources: ["local", "url", "camera"],
    language: "he",
    showUploadMoreButton: false,
    showPoweredBy: false,
  };

  const progressPercentage = (photos.length / 3) * 100;

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-secondary">
          תמונות הפרופיל שלך
        </h3>
        <p className="text-neutral-600 text-sm mt-2">
          עליך להעלות בדיוק 3 תמונות כדי להשלים את הרישום
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-secondary font-medium">
            {photos.length}/3 תמונות
          </span>
          <span className="text-neutral-600">{progressPercentage}% הושלם</span>
        </div>
        <Progress
          value={progressPercentage}
          classNames={{
            indicator:
              "bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27]",
          }}
          aria-label="התקדמות העלאת תמונות"
        />
      </div>

      {photos.length === 3 ? (
        <div className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-2 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>יש לך 3 תמונות! ניתן להמשיך</span>
        </div>
      ) : (
        <div className="text-center text-neutral-600 text-sm">
          יש להעלות {3 - photos.length} תמונות נוספות
        </div>
      )}

      {uploadError && (
        <div className="text-center text-danger text-sm">{uploadError}</div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="aspect-square relative rounded-lg overflow-hidden border-2 border-dashed border-neutral-300"
          >
            {photos[index] ? (
              <div className="relative h-full">
                <Image
                  src={photos[index].url}
                  alt={`תמונה ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="הסר תמונה"
                >
                  <IoMdCloseCircle size={24} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-neutral-100">
                {uploading && index === photos.length ? (
                  <span className="text-secondary text-xs animate-pulse">
                    מעלה...
                  </span>
                ) : (
                  <span className="text-neutral-400 text-xs text-center">
                    תמונה {index + 1}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {photos.length < 3 && (
        <div className="flex justify-center mt-6">
          <CldUploadButton
            options={cloudinaryOptions}
            onSuccess={onUploadSuccess}
            onError={onUploadError}
            uploadPreset="nm-demo"
            signatureEndpoint="/api/sign-image"
            className={`flex items-center justify-center gap-2 text-white rounded-lg py-4 px-8 transition-all hover:shadow-lg
               bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] w-full max-w-xs text-lg font-medium ${
                 uploading ? "opacity-70 cursor-not-allowed" : ""
               }`}
            onClick={() => {
              if (!uploading) {
                setUploading(true);
                setUploadError(null);
              }
            }}
          >
            <HiPhoto size={28} />
            <span>
              {uploading
                ? "מעלה תמונה..."
                : photos.length === 0
                  ? "הוסף תמונה 1 מתוך 3"
                  : photos.length === 1
                    ? "הוסף תמונה 2 מתוך 3"
                    : "הוסף תמונה 3 מתוך 3"}
            </span>
          </CldUploadButton>
        </div>
      )}

      {errors.photos && (
        <p className="text-danger text-sm text-center mt-2">
          {errors.photos.message as string}
        </p>
      )}
    </div>
  );
}
