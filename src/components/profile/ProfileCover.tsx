"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Member } from "@prisma/client";
import { Camera, MapPin, Edit2 } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { calculateAge } from "@/lib/util";
import PresenceDot from "../PresenceDot";
import PremiumLabel from "@/components/PremiumLabel";
import { isActivePremium } from "@/lib/premiumUtils";
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

function PremiumIconWithTooltip() {
    const [visible, setVisible] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!visible) return;
        const dismiss = (e: MouseEvent | TouchEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setVisible(false);
            }
        };
        document.addEventListener("mousedown", dismiss);
        document.addEventListener("touchstart", dismiss);
        return () => {
            document.removeEventListener("mousedown", dismiss);
            document.removeEventListener("touchstart", dismiss);
        };
    }, [visible]);

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex items-center flex-shrink-0"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onClick={() => setVisible((v) => !v)}
            aria-label="Miel+ Premium"
        >
            {/* Tooltip — always in DOM, opacity-only transition → no layout shift */}
            <span
                role="tooltip"
                className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-neutral-900 text-white text-xs whitespace-nowrap max-w-[160px] text-center shadow-sm transition-opacity duration-150 z-50 ${visible ? "opacity-100" : "opacity-0"
                    }`}
            >
                <span className="block font-semibold">חבר/ת Miel+</span>
                <span className="block font-normal">חשבון פרימיום פעיל</span>
            </span>

            <Image
                src="/images/icons/p.png"
                alt="Miel+ Premium"
                width={16}
                height={16}
                draggable={false}
            />
        </span>
    );
}

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
                    </h1>
                    {/* Badges: Verified icon + Premium icon with tooltip */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {member.user?.oauthVerified && (
                            <MdVerified
                                className="text-blue-400 flex-shrink-0"
                                style={{ width: 20, height: 20 }}
                                aria-label="חשבון מאומת"
                            />
                        )}
                        {isActivePremium(member.user) && (
                            <span className="bg-white p-[3px] rounded-full shadow-sm flex-shrink-0 flex items-center justify-center">
                                <PremiumIconWithTooltip />
                            </span>
                        )}
                    </div>
                </div>
                {/* Premium membership block — own profile only */}
                {isOwnProfile && <PremiumLabel user={member.user} variant="profile" />}
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
