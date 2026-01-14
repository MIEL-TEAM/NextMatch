"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiBarChart, FiEye, FiStar, FiX } from "react-icons/fi";
import { getStoryAnalytics } from "@/app/actions/storyActions";
import { toast } from "sonner";
import { StoryAnalyticsData, StoryAnalyticsProps } from "@/types/stories";

export function StoryAnalytics({
  storyId,
  isCurrentUserStory,
}: StoryAnalyticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<StoryAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiresPremium, setRequiresPremium] = useState(false);

  const handleOpenAnalytics = async () => {
    if (!isCurrentUserStory) return;

    setLoading(true);
    setIsOpen(true);

    try {
      const result = await getStoryAnalytics(storyId);

      if (result.status === "error") {
        if (result.requiresPremium) {
          setRequiresPremium(true);
        } else {
          const errorMessage = Array.isArray(result.error)
            ? result.error.map((err) => err.message).join(", ")
            : result.error || "Failed to load analytics";
          toast.error(errorMessage);
          setIsOpen(false);
        }
        return;
      }

      setAnalytics(result.data);
      setRequiresPremium(false);
    } catch (error) {
      console.error("Error loading story analytics:", error);
      toast.error("Failed to load analytics");
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const formatViewTime = (viewedAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(viewedAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours > 0) {
      return `לפני ${hours} שעות`;
    } else if (minutes > 0) {
      return `לפני ${minutes} דקות`;
    } else {
      return "זה עתה";
    }
  };

  if (!isCurrentUserStory) return null;

  return (
    <>
      <button
        onClick={handleOpenAnalytics}
        className="w-8 h-8 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 backdrop-blur-sm"
        title="צפה בנתוני הסטורי"
      >
        <FiBarChart size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FiBarChart className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">נתוני הסטורי</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : requiresPremium ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiStar className="text-white" size={24} />
                  </div>
                  <h4 className="font-bold text-lg mb-2">פיצ&apos;ר פרימיום</h4>
                  <p className="text-gray-600 mb-6">
                    כדי לראות מי צפה בסטורי שלך, עליך לשדרג לחשבון פרימיום
                  </p>
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiStar size={18} />
                    שדרג לפרימיום
                  </Link>
                </div>
              ) : analytics ? (
                <div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FiEye className="text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        סך הצפיות
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics.totalViews}
                    </p>
                  </div>

                  {analytics.viewers.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        מי צפה בסטורי ({analytics.viewers.length})
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {analytics.viewers.map((viewer) => (
                          <div
                            key={`${viewer.id}-${viewer.viewedAt}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Image
                              src={viewer.image || "/images/user.png"}
                              alt={viewer.name}
                              width={40}
                              height={40}
                              className="rounded-full border-2 border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {viewer.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatViewTime(viewer.viewedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FiEye size={32} className="mx-auto mb-2 opacity-50" />
                      <p>אף אחד לא צפה בסטורי עדיין</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
