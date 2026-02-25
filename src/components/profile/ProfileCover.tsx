"use client";

import React from "react";
import Image from "next/image";
import { Member } from "@prisma/client";
import { Chip } from "@nextui-org/react";
import { Camera, MapPin, Edit2 } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { calculateAge } from "@/lib/util";
import PresenceDot from "../PresenceDot";
import PremiumMark from "@/components/PremiumMark";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";

type ProfileCoverProps = {
    member: Member & {
        user?: {
            oauthVerified?: boolean;
            lastActiveAt?: Date | null;
            isPremium?: boolean;
            premiumUntil?: Date | null;
        } | null;
        coverImage?: string | null;
    };
    isOwnProfile: boolean;
    onCoverUploadSuccess: (result: CloudinaryUploadWidgetResults) => void;
};

export default function ProfileCover({
    member,
    isOwnProfile,
    onCoverUploadSuccess,
}: ProfileCoverProps) {
    const router = useRouter();
    const coverImageUrl = (member as any).coverImage;

    return (
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
                    onSuccess={onCoverUploadSuccess}
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
                                ,{calculateAge(member.dateOfBirth)}
                            </span>
                        )}
                        <PremiumMark
                            isActivePremium={
                                Boolean(member.user?.isPremium) &&
                                Boolean(member.user?.premiumUntil) &&
                                new Date(member.user!.premiumUntil!) > new Date()
                            }
                        />
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
                            startContent={<MdVerified className="text-blue-500 w-5 h-5" />}
                        >
                            מאומת
                        </Chip>
                    )}
                </div>
                {/* Location */}
                <div className="flex items-center gap-2">
                    {!isOwnProfile && <PresenceDot member={member} size="md" />}
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
    );
}
