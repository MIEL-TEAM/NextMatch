"use client";

import React, { useState } from "react";
import { Member } from "@prisma/client";
import { Avatar, Chip } from "@nextui-org/react";
import { Camera, MapPin, Edit2, MessageCircle, Heart, Share2, Images } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { calculateAge } from "@/lib/util";
import PresenceDot from "./PresenceDot";
import Image from "next/image";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { updateCoverImage } from "@/app/actions/userActions";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";
import { useRouter } from "next/navigation";
import { toggleLikeMember } from "@/app/actions/likeActions";

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
};

export default function DesktopProfileView({
  member,
  isOwnProfile,
  userId,
  initialLiked,
}: DesktopProfileViewProps) {
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const router = useRouter();
  
  const coverImageUrl = (member as any).coverImage;

  const handleCoverUploadSuccess = async (result: CloudinaryUploadWidgetResults) => {
    try {
      if (result.info && typeof result.info !== "string") {
        const url = result.info.secure_url;
        const publicId = result.info.public_id;

        await updateCoverImage(url, publicId);

        toast.success("התמונה שלך עודכנה בהצלחה!", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });

        window.location.reload();
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast.error("שגיאה בהעלאת התמונה", {
        style: {
          ...getToastStyle(),
          textAlign: "center",
        },
      });
    }
  };

  const handleLikeToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleLikeMember(member.userId, hasLiked);

      if (result.success) {
        setHasLiked(!hasLiked);
        toast.success(hasLiked ? "הוסר מהאהובים" : "נוסף לאהובים", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      } else if (result.alreadyLiked) {
        toast.error(`כבר עשית לייק ל${member.name}`, {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      } else {
        toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("אירעה שגיאה, נסו שוב מאוחר יותר", {
        style: {
          ...getToastStyle(),
          textAlign: "center",
        },
      });
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
        toast.success("קישור לפרופיל הועתק", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("שגיאה בשיתוף הפרופיל", {
          style: {
            ...getToastStyle(),
            textAlign: "center",
          },
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Cover Image Section - Taller */}
      <div className="relative w-full h-80 bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] overflow-hidden rounded-t-3xl">
        {coverImageUrl ? (
          <>
            <Image
              src={coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
            {/* Dark gradient overlay only at the bottom where text is */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/100 via-black/50 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] flex items-center justify-center">
            <div className="text-white/30 text-8xl font-bold">
              {member.name?.charAt(0) || "?"}
            </div>
          </div>
        )}

        {/* Update Cover Button - Only for own profile */}
        {isOwnProfile && (
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
            onSuccess={handleCoverUploadSuccess}
            signatureEndpoint="/api/sign-image"
            uploadPreset="nm-demo"
            className="absolute top-6 right-6 bg-white/90 hover:bg-white text-[#E37B27] rounded-full p-3 transition-all shadow-lg"
          >
            <Camera size={22} />
          </CldUploadButton>
        )}

        {/* Name, Age, Badge, and Location - Overlaid on Cover */}
        <div className="absolute bottom-10 right-[15rem] z-20" dir="rtl">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              {member.name}
              {member.dateOfBirth && (
                <span className="text-white/90">
                  , {calculateAge(member.dateOfBirth)}
                </span>
              )}
            </h1>
            {/* Verification Badge */}
            {member.user?.oauthVerified && (
              <Chip
                size="lg"
                variant="flat"
                classNames={{
                  base: "bg-blue-50 border-blue-200 border",
                  content: "text-blue-600 font-semibold",
                }}
                startContent={
                  <MdVerified className="text-blue-500 w-5 h-5" />
                }
              >
                מאומת
              </Chip>
            )}
          </div>
          {/* Location */}
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
              <PresenceDot member={member} size="md" />
            )}
            <MapPin size={20} className="text-white drop-shadow-lg" />
            <span className="text-lg font-medium text-white drop-shadow-lg">
              {member.city}, {member.country}
            </span>

            {isOwnProfile && (
                <button
                  onClick={() => router.push("/members/edit")}
                  className="w-7 h-7 rounded-full border-2 p-1 border-white text-white hover:bg-white/20 font-semibold flex items-center justify-center transition-all"
                  aria-label="Edit profile"
                >
                  <Edit2 size={16} className="text-white" />
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Profile Info Card - Less overlap, cleaner spacing */}
      <div className="relative px-6 -mt-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          {/* Profile Photo */}
          <div className="flex items-start -mt-40 mb-2">
            <div className="relative">
              <Avatar
                src={member.image || "/images/user.png"}
                className="w-44 h-44 border-4 border-white shadow-md ring-2 ring-[#FFB547]/20 rounded-2xl"
                alt={member.name}
                radius="lg"
              />
              {isOwnProfile && (
                <button
                  onClick={() => router.push(`/members/edit/photos`)}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#F6D365] to-[#E37B27] hover:from-[#FFB547] hover:to-[#E37B27] text-white rounded-full p-2 shadow-lg transition-all"
                  aria-label="Upload photo"
                >
                  <Camera size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Description Section with Action Buttons */}
          <div className="w-full overflow-hidden">
            {/* Header - Only show for own profile */}
            {isOwnProfile && (
              <div className="mb-4 pb-3 border-b-2 border-divider">
                <h3 className="text-lg font-semibold text-default-600" dir="rtl">
                  כמה מילים על עצמי
                </h3>
              </div>
            )}

            {/* Description Body */}
            {member.description && (
              <div className="w-full" dir="rtl">
                <p className={`text-base text-gray-600 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                  {member.description}
                </p>
                {member.description.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-gray-500 hover:text-[#E37B27] font-medium text-sm mt-2 transition-colors"
                  >
                    {isDescriptionExpanded ? 'קצר יותר' : 'קרא עוד'}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons - Only for visitors */}
            {!isOwnProfile && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-divider">
                {/* Chat Button */}
                <button
                  onClick={() => router.push(`/members/${userId}/chat`)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F6D365] to-[#E37B27] hover:from-[#FFB547] hover:to-[#E37B27] flex items-center justify-center shadow-sm transition-all"
                >
                  <MessageCircle size={16} className="text-white" />
                </button>

                {/* Like Button */}
                <button
                  onClick={handleLikeToggle}
                  disabled={loading}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                    hasLiked 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white border-2 border-red-200 hover:bg-red-50'
                  }`}
                >
                  <Heart 
                    size={16} 
                    className={hasLiked ? 'text-white fill-white' : 'text-red-400'}
                  />
                </button>

                {/* Photos Button */}
                <button
                  onClick={() => router.push(`/members/${userId}/photos`)}
                  className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-200 hover:bg-purple-200 flex items-center justify-center shadow-sm transition-all"
                >
                  <Images size={16} className="text-purple-600" />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 hover:bg-blue-200 flex items-center justify-center shadow-sm transition-all"
                >
                  <Share2 size={16} className="text-blue-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>  
  );
}
