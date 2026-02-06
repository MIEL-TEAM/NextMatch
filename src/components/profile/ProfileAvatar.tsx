"use client";

import React from "react";
import { Avatar } from "@nextui-org/react";
import { Camera } from "lucide-react";
import { Member } from "@prisma/client";
import { useRouter } from "next/navigation";

type ProfileAvatarProps = {
    member: Member;
    isOwnProfile: boolean;
};

export default function ProfileAvatar({ member, isOwnProfile }: ProfileAvatarProps) {
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
    );
}
