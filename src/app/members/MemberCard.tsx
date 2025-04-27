"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { toggleLikeMember } from "../actions/likeActions";
import MemberImageCarousel from "@/components/MemberImageCarousel";

type MemberCardProps = {
  member: Member;
  likeIds: string[];
  memberPhotos?: Array<{ url: string; id: string }>;
};

export default function MemberCard({
  member,
  likeIds,
  memberPhotos = [],
}: MemberCardProps) {
  const [hasLiked, setHasLiked] = useState(likeIds.includes(member.userId));
  const [loading, setLoading] = useState(false);

  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      await toggleLikeMember(member.userId, hasLiked);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error("Like toggle error:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderCardContent = (imageUrl: string) => (
    <Card
      as={Link}
      href={`/members/${member.userId}`}
      isPressable
      className="w-full h-full shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          isZoomed
          alt={member.name}
          src={transformImageUrl(imageUrl) || "/images/user.png"}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out transform group-hover:scale-105"
          removeWrapper
        />

        <div className="absolute top-3 right-3 z-10">
          <LikeButton
            loading={loading}
            toggleLike={toggleLike}
            hasLiked={hasLiked}
          />
        </div>

        <div className="absolute top-2 left-3 z-10">
          <PresenceDot member={member} />
        </div>

        <CardFooter className="flex justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient w-full rounded-b-lg p-2">
          <div className="flex flex-col text-white">
            <span className="font-semibold text-sm">
              {member.name}, {calculateAge(member.dateOfBirth)}
            </span>
            <span className="text-xs">{member.city}</span>
          </div>
        </CardFooter>
      </div>
    </Card>
  );

  if (memberPhotos.length <= 1) {
    const defaultImage =
      memberPhotos.length === 1 ? memberPhotos[0].url : "/images/user.png";
    return renderCardContent(defaultImage);
  }

  return (
    <div className="group">
      <MemberImageCarousel images={memberPhotos}>
        {(currentImage) => renderCardContent(currentImage.url)}
      </MemberImageCarousel>
    </div>
  );
}
