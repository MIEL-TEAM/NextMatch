"use client";

import React from "react";
import { MessageCircle, Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileActionsProps = {
    userId: string;
    hasLiked: boolean;
    loading: boolean;
    isSharing: boolean;
    onLikeToggle: () => void;
    onShare: () => void;
};

export default function ProfileActions({
    userId,
    hasLiked,
    loading,
    isSharing,
    onLikeToggle,
    onShare,
}: ProfileActionsProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-divider mt-4">
            {/* Chat Button */}
            <button
                onClick={() => router.push(`/members/${userId}/chat`)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F6D365] to-[#E37B27] hover:from-[#FFB547] hover:to-[#E37B27] flex items-center justify-center shadow-sm transition-all"
            >
                <MessageCircle size={16} className="text-white" />
            </button>

            {/* Like Button */}
            <button
                onClick={onLikeToggle}
                disabled={loading}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${hasLiked
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white border-2 border-red-200 hover:bg-red-50"
                    }`}
            >
                <Heart
                    size={16}
                    className={hasLiked ? "text-white fill-white" : "text-red-400"}
                />
            </button>

            {/* Share Button */}
            <button
                onClick={onShare}
                disabled={isSharing}
                className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 hover:bg-blue-200 flex items-center justify-center shadow-sm transition-all"
            >
                <Share2 size={16} className="text-blue-600" />
            </button>
        </div>
    );
}
