"use client";

import React from "react";
import { Avatar } from "@nextui-org/react";
import { Member } from "@prisma/client";
import { useRouter } from "next/navigation";
import IconWithTooltip from "@/components/IconWithTooltip";
import Icon from "@/lib/table/Icon";

type ProfileAvatarProps = {
    member: Member;
    isOwnProfile: boolean;
    isPremium?: boolean;
};

export default function ProfileAvatar({ member, isOwnProfile, isPremium }: ProfileAvatarProps) {
    const router = useRouter();

    return (
        <div className="flex items-start -mt-40 mb-2">
            <div className="relative">
                <Avatar
                    src={member.image || "/images/user.png"}
                    className="w-44 h-44 border-4 border-white shadow-md ring-2 ring-[#FFB547]/20 rounded-2xl"
                    alt={member.name}
                    radius="lg"
                />
                {/* Premium fire badge — top-right corner, inside the image */}
                {isPremium && (
                    <span className="absolute top-2 right-2 bg-white p-[6px] rounded-full shadow-md flex items-center justify-center z-10">
                        <IconWithTooltip
                            icon={<Icon name="fire" className="size-[15px] bg-[#FFB547]" />}
                            title="חבר/ת Miel+"
                            description="חשבון פרימיום פעיל"
                            placement="above"
                            align="right"
                        />
                    </span>
                )}
                {isOwnProfile && (
                    <button
                        onClick={() => router.push(`/members/edit/photos`)}
                        className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#F6D365] to-[#E37B27] hover:from-[#FFB547] hover:to-[#E37B27] text-white rounded-full p-2 shadow-lg transition-all"
                        aria-label="Upload photo"
                    >
                        <Icon name="camera" className="size-4 bg-white" />
                    </button>
                )}
            </div>
        </div>
    );
}
