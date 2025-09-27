"use client";

import { useState } from "react";
import { FiX, FiSend } from "react-icons/fi";
import Image from "next/image";
import { sendStoryMessage } from "@/app/actions/storyActions";
import { toast } from "react-hot-toast";

interface StoryMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyImageUrl: string;
  storyOwnerName: string;
  storyOwnerImage?: string | null;
}

export function StoryMessageModal({
  isOpen,
  onClose,
  storyId,
  storyImageUrl,
  storyOwnerName,
  storyOwnerImage,
}: StoryMessageModalProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const result = await sendStoryMessage(storyId, message.trim());

      if (result.status === "success") {
        toast.success("הודעה נשלחה בהצלחה! 💌");
        setMessage("");
        onClose();
      } else {
        const errorMessage = Array.isArray(result.error)
          ? result.error.map((err) => err.message).join(", ")
          : result.error || "שגיאה בשליחת ההודעה";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending story message:", error);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Image
              src={storyOwnerImage || "/images/user.png"}
              alt={storyOwnerName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">
                שלח הודעה ל-{storyOwnerName}
              </h3>
              <p className="text-sm text-gray-500">תגובה על הסטורי</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Story Preview */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={storyImageUrl}
                alt="Story preview"
                width={48}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                מגיב/ה על הסטורי של {storyOwnerName}
              </p>
              <p className="text-xs text-gray-400">
                ההודעה תישלח ישירות לצ&apos;אט
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="כתוב את התגובה שלך..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {message.length}/500
              </span>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend size={16} />
                )}
                <span>{isLoading ? "שולח..." : "שלח"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0">
          <p className="text-xs text-gray-500 mb-2">תגובות מהירות:</p>
          <div className="flex flex-wrap gap-2">
            {["😍 מדהים!", "🔥 וואו!", "❤️ אהבתי!", "👏 כל הכבוד!"].map(
              (quickResponse) => (
                <button
                  key={quickResponse}
                  onClick={() => setMessage(quickResponse)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  {quickResponse}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
