"use client";

import { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import {
  CldUploadButton,
  CloudinaryUploadWidgetOptions,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { HiPhoto } from "react-icons/hi2";
import { IoMdCloseCircle } from "react-icons/io";
import Image from "next/image";

interface ExtendedCloudinaryOptions extends CloudinaryUploadWidgetOptions {
  moderation?: string;
}

interface PhotoUploadFormProps {
  onSubmit?: () => void;
}

export default function PhotoUploadForm({ onSubmit }: PhotoUploadFormProps) {
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

  const cloudinaryOptions: ExtendedCloudinaryOptions = {
    maxFiles: 1,
    multiple: false,
    cropping: true,
    sources: ["local", "url", "camera"],
    language: "he",
    showUploadMoreButton: false,
    showPoweredBy: false,
    folder: "registration/profiles",
    moderation: "aws_rek",
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-secondary">
          תמונות הפרופיל שלך
        </h3>
        <p className="text-neutral-600 text-sm mt-2">
          תוכל להוסיף עד 3 תמונות או להמשיך בלי תמונות
        </p>
      </div>

      {/* Status message */}
      <div className="text-center">
        {photos.length === 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-700 text-sm mb-3">
              💡 <strong>טיפ:</strong> תמונות מגדילות את הסיכוי להתאמות ב-80%
            </div>
            <div className="text-blue-600 text-xs">
              תוכל להוסיף תמונות עכשיו או להמשיך בלי תמונות
            </div>
          </div>
        ) : photos.length === 3 ? (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-green-700 text-sm flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              מצוין! יש לך 3 תמונות
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="text-amber-700 text-sm">
              יש לך {photos.length} תמונות (תוכל להוסיף עוד {3 - photos.length})
            </div>
          </div>
        )}
      </div>

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

      {/* Clear instructions */}
      <div className="text-center mt-6 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          {photos.length === 0 ? (
            <span>
              💡 תוכל להוסיף תמונות או{" "}
              <button
                type="button"
                onClick={onSubmit}
                className="text-[#E37B27] font-semibold hover:text-[#FFB547] underline transition-colors cursor-pointer"
              >
                המשך בלי תמונות
              </button>
            </span>
          ) : (
            <span>
              ✨ מצוין!{" "}
              <button
                type="button"
                onClick={onSubmit}
                className="text-[#E37B27] font-semibold hover:text-[#FFB547] underline transition-colors cursor-pointer"
              >
                השלם רישום
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
