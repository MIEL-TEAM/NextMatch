"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FiX, FiUpload, FiType } from "react-icons/fi";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import { createStory } from "@/app/actions/storyActions";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0.5, y: 0.3 }); // Default safe position
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

    // Reset text position when new image is selected
    setTextPosition({ x: 0.5, y: 0.3 });

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
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
      toast.error("Please select an image");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Cloudinary first
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
        throw new Error("Failed to upload image to Cloudinary");
      }

      const cloudinaryData = await cloudinaryResponse.json();

      // Create story using server action
      const storyFormData = new FormData();
      storyFormData.append("imageUrl", cloudinaryData.secure_url);
      storyFormData.append("publicId", cloudinaryData.public_id);
      storyFormData.append("textOverlay", textOverlay);
      storyFormData.append("textX", textPosition.x.toString());
      storyFormData.append("textY", textPosition.y.toString());
      storyFormData.append("privacy", "PUBLIC");

      const result = await createStory(storyFormData);

      if (result.status === "success") {
        toast.success("Story created successfully! 🎉");
        onStoryCreated();
        handleClose();
      } else {
        const errorMessage = Array.isArray(result.error)
          ? result.error.map((e) => e.message).join(", ")
          : result.error || "Failed to create story";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(
        "Failed to create story. Make sure to set up Cloudinary upload preset 'miel_stories'"
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
          <h2 className="text-lg font-semibold">Create Story</h2>
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
              <p className="text-gray-600">Click to upload an image</p>
              <p className="text-sm text-gray-400 mt-2">Max size: 5MB</p>
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
                alt="Story preview"
                width={400}
                height={400}
                className="w-full h-64 object-cover rounded-lg"
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FiType size={16} />
                Add Text (Optional)
              </label>
              <textarea
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
                placeholder="Add text to your story..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                rows={3}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 text-right">
                {textOverlay.length}/100
              </p>
            </div>
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
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleCreateStory}
            className="flex-1 bg-gradient-to-r from-orange-400 to-orange-600"
            disabled={!selectedImage || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? "Creating..." : "Share Story"}
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
