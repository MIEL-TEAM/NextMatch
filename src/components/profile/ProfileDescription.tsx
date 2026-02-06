"use client";

import React from "react";
import { Member } from "@prisma/client";

type ProfileDescriptionProps = {
    member: Member & { description?: string };
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
    return (
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
