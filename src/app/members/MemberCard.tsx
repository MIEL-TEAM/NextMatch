"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge } from "@/lib/util";
import { Card, CardFooter } from "@nextui-org/react";
import { Member, Photo } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { toggleLikeMember } from "../actions/likeActions";
import MemberImageCarousel from "@/components/MemberImageCarousel";

type UserMemberProps = {
  member: Member;
  likeIds: string[];
  photos: Photo[];
};

export default function MemberCard({
  member,
  likeIds,
  photos,
}: UserMemberProps) {
  const [hasLiked, setHasLiked] = useState(likeIds.includes(member.userId));
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    setLoading(true);
    try {
      await toggleLikeMember(member.userId, hasLiked);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const preventLinkAction = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mx-auto w-full p-2 sm:p-4">
      <Card
        as={Link}
        href={`/members/${member.userId}`}
        isPressable
        className="w-full h-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <MemberImageCarousel
            photos={photos}
            defaultImageUrl={member.image}
            preventNavigate={preventLinkAction}
          />
          <div onClick={preventLinkAction}>
            <div className="absolute top-3 right-3 z-10">
              <LikeButton
                loading={loading}
                toggleLike={toggleLike}
                hasLiked={hasLiked}
              />
            </div>
            <div className="absolute top-2 left-3 z-[10]">
              <PresenceDot member={member} />
            </div>
          </div>
        </div>
        <CardFooter className="flex justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient w-full rounded-b-lg p-2">
          <div className="flex flex-col text-white">
            <span className="font-semibold text-sm">
              {member.name}, {calculateAge(member.dateOfBirth)}
            </span>
            <span className="text-xs">{member.city}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
