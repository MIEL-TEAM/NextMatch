"use client";

import React from "react";
import { Member } from "@prisma/client";

type ProfileDescriptionProps = {
    member: Member & {
        description?: string;
        headline?: string | null;
        occupation?: string | null;
        profession?: string | null;
    };
    isOwnProfile: boolean;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
};

export default function ProfileDescription({
    member,
    isOwnProfile,
    isExpanded,
    setIsExpanded,
}: ProfileDescriptionProps) {
    const headlineParts = [
        member.headline,
        member.occupation,
        member.profession,
    ].filter(Boolean);

    return (
        <div className="w-full overflow-hidden">
            {/* Preview mode label — own profile only */}
            {isOwnProfile && (
                <p className="text-xs text-gray-400 mb-2" dir="rtl">
                    👁 ככה אחרים רואים אותך
                </p>
            )}

            {/* Identity headline */}
            {headlineParts.length > 0 && (
                <p className="text-sm text-gray-600 mt-1 mb-2" dir="rtl">
                    {headlineParts.join(" • ")}
                </p>
            )}

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
                    <p
                        className={`text-base text-gray-600 leading-relaxed ${!isExpanded ? "line-clamp-2" : ""
                            }`}
                    >
                        {member.description}
                    </p>
                    {member.description.length > 150 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-[#E37B27] font-medium text-sm mt-2 transition-colors"
                        >
                            {isExpanded ? "קצר יותר" : "קרא עוד"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
