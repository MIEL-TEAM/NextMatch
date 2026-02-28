"use client";

import React, { useState } from "react";
import { Member, Photo } from "@prisma/client";
import { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { updateCoverImage } from "@/app/actions/userActions";
import { toast } from "react-toastify";
import { toggleLikeMember } from "@/app/actions/likeActions";
import ProfileCover from "./profile/ProfileCover";
import ProfileAvatar from "./profile/ProfileAvatar";
import ProfileDescription from "./profile/ProfileDescription";
import ProfileActions from "./profile/ProfileActions";
import ProfilePhotoGallery from "./profile/ProfilePhotoGallery";
import { isActivePremium } from "@/lib/premiumUtils";

type DesktopProfileViewProps = {
  member: Member & {
    user?: {
      oauthVerified?: boolean;
      emailVerified?: Date | null;
      lastActiveAt?: Date | null;
    } | null;
    coverImage?: string | null;
    description?: string;
  };
  isOwnProfile: boolean;
  userId: string;
  initialLiked: boolean;
  photos: Photo[];
};

export default function DesktopProfileView({
  member,
  isOwnProfile,
  userId,
  initialLiked,
  photos,
}: DesktopProfileViewProps) {
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Prepare photos for gallery
  const galleryPhotos = React.useMemo(() => {
    if (!photos || photos.length === 0) {
      return member.image ? [{ url: member.image, id: "profile" }] : [];
    }
    return photos.filter((p) => p.url).map((p) => ({ url: p.url, id: p.id }));
  }, [photos, member.image]);

  const handleCoverUploadSuccess = async (
    result: CloudinaryUploadWidgetResults
  ) => {
    try {
      if (result.info && typeof result.info !== "string") {
        const url = result.info.secure_url;
        const publicId = result.info.public_id;

        await updateCoverImage(url, publicId);

        toast.success("התמונה שלך עודכנה בהצלחה!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast.error("שגיאה בהעלאת התמונה");
    }
  };

  const handleLikeToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleLikeMember(member.userId, hasLiked);

      if (result.success) {
        setHasLiked(!hasLiked);
        toast.success(hasLiked ? "הוסר מהאהובים" : "נוסף לאהובים");
      } else if (result.alreadyLiked) {
        toast.error(`כבר עשית לייק ל${member.name}`);
      } else {
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר");
      }
    } catch (error) {
      console.log(error);
      toast.error("אירעה שגיאה, נסו שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `בדוק את הפרופיל של ${member.name}`,
          text: `מצאתי פרופיל מעניין: ${member.name}`,
          url: `/members/${userId}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `${window.location.origin}/members/${userId}`
        );
        toast.success("קישור לפרופיל הועתק");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("שגיאה בשיתוף הפרופיל");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Cover Image Section */}
      <ProfileCover
        member={member}
        isOwnProfile={isOwnProfile}
        onCoverUploadSuccess={handleCoverUploadSuccess}
      />

      {/* Profile Info Card */}
      <div className="relative px-6 -mt-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <ProfileAvatar member={member} isOwnProfile={isOwnProfile} isPremium={isActivePremium((member as any).user)} />

          <ProfileDescription
            member={member}
            isOwnProfile={isOwnProfile}
            isExpanded={isDescriptionExpanded}
            setIsExpanded={setIsDescriptionExpanded}
          />

          {!isOwnProfile && (
            <ProfileActions
              userId={userId}
              hasLiked={hasLiked}
              loading={loading}
              isSharing={isSharing}
              onLikeToggle={handleLikeToggle}
              onShare={handleShare}
            />
          )}
        </div>
      </div>

      {/* Photo Gallery Section */}
      {galleryPhotos.length > 0 && (
        <ProfilePhotoGallery
          photos={galleryPhotos}
          isOwnProfile={isOwnProfile}
        />
      )}
    </div>
  );
}