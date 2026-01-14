"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiX, FiUpload, FiType } from "react-icons/fi";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import { createStory } from "@/app/actions/storyActions";
import { ArrowUp, ArrowDown, ArrowLeftRight } from "lucide-react";
import { CreateStoryModalProps } from "@/types/stories";

export function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0.5, y: 0.3 }); // Default safe position
  const [imagePosition, setImagePosition] = useState<
    "center" | "top" | "bottom"
  >("center");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle text positioning
  const handleTextDrag = (e: React.MouseEvent) => {
    if (!imageContainerRef.current || !textOverlay) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Allow free positioning but clamp to image bounds
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    setTextPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleTextDrag(e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // איפוס מיקום הטקסט והתמונה בעת בחירת תמונה חדשה
    setTextPosition({ x: 0.5, y: 0.3 });
    setImagePosition("center");

    if (!file.type.startsWith("image/")) {
      toast.error("אנא בחר קובץ תמונה");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("גודל התמונה חייב להיות עד 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = async () => {
    if (!selectedImage) {
      toast.error("אנא בחר תמונה");
      return;
    }

    setIsUploading(true);

    try {
      // העלאה ל-Cloudinary
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "miel_stories");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("העלאת התמונה ל-Cloudinary נכשלה");
      }

      const cloudinaryData = await cloudinaryResponse.json();

      // יצירת סיפור דרך Server Action
      const storyFormData = new FormData();
      storyFormData.append("imageUrl", cloudinaryData.secure_url);
      storyFormData.append("publicId", cloudinaryData.public_id);
      storyFormData.append("textOverlay", textOverlay);
      storyFormData.append("textX", textPosition.x.toString());
      storyFormData.append("textY", textPosition.y.toString());
      storyFormData.append("privacy", "PUBLIC");

      const result = await createStory(storyFormData);

      if (result.status === "success") {
        toast.success("הסיפור נוצר בהצלחה! 🎉");
        onStoryCreated();
        handleClose();
      } else {
        const errorMessage = Array.isArray(result.error)
          ? result.error.map((e) => e.message).join(", ")
          : result.error || "יצירת הסיפור נכשלה";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("שגיאה ביצירת הסיפור:", error);
      toast.error(
        "יצירת הסיפור נכשלה. ודא שקיים Upload Preset בשם 'miel_stories' ב-Cloudinary"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setTextOverlay("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">יצירת סיפור</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 transition-colors"
            >
              <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">לחץ כדי להעלות תמונה</p>
              <p className="text-sm text-gray-400 mt-2">גודל מקסימלי: 5MB</p>
            </div>
          ) : (
            <div
              ref={imageContainerRef}
              className="relative cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <Image
                src={imagePreview}
                alt="תצוגה מקדימה של הסיפור"
                width={400}
                height={400}
                className="w-full h-64 object-cover rounded-lg"
                style={{
                  objectPosition:
                    imagePosition === "top"
                      ? "center top"
                      : imagePosition === "bottom"
                        ? "center bottom"
                        : "center center",
                }}
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-10"
              >
                <FiX size={16} />
              </button>

              {textOverlay && (
                <div
                  className="absolute cursor-move select-none"
                  style={{
                    left: `${textPosition.x * 100}%`,
                    top: `${textPosition.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <p className="text-white text-xl font-bold text-center px-4 py-2 bg-black bg-opacity-50 rounded-lg max-w-xs backdrop-blur-sm drop-shadow-lg">
                    {textOverlay}
                  </p>
                </div>
              )}
            </div>
          )}

          {imagePreview && (
            <>
              {/* Image Position Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  מיקום התמונה
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImagePosition("top")}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      imagePosition === "top"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    למעלה
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePosition("center")}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      imagePosition === "center"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    מרכז
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagePosition("bottom")}
                    className={`flex-1 px-4 py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      imagePosition === "bottom"
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    למטה
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-right">
                  בחר את המיקום של התמונה במסגרת הסיפור
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiType size={16} />
                  הוספת טקסט (לא חובה)
                </label>
                <textarea
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="הוסף טקסט לסיפור שלך..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  rows={3}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 text-right">
                  {textOverlay.length}/100
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button
            variant="bordered"
            onClick={handleClose}
            className="flex-1"
            disabled={isUploading}
          >
            ביטול
          </Button>
          <Button
            color="primary"
            onClick={handleCreateStory}
            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600"
            disabled={!selectedImage || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? "יוצר סיפור..." : "שתף סיפור"}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
