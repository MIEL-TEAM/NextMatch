"use client";

import LikeButton from "@/components/LikeButton";
import PresenceDot from "@/components/PresenceDot";
import { calculateAge, transformImageUrl } from "@/lib/util";
import { Card, CardFooter, Image } from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";

type UserMemberProps = {
  member: Member;
  likeIds: string[];
};

export default function MemberCard({ member, likeIds }: UserMemberProps) {
  const hasLiked = likeIds.includes(member.userId);

  const preventLinkAction = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <div className="mx-auto">
        <Card as={Link} href={`/members/${member.userId}`} isPressable>
          <Image
            isZoomed
            alt={member.name}
            width={300}
            height={""}
            src={transformImageUrl(member.image) || "/images/user.png"}
            className="aspect-square object-cover"
          />
          <div onClick={preventLinkAction}>
            <div className="absolute top-3 right-3 z-10">
              <LikeButton targetId={member.userId} hasLiked={hasLiked} />
            </div>
            <div className="absolute top-2 left-3 z-50">
              <PresenceDot member={member} />
            </div>
          </div>
          <CardFooter className="flex w-80 justify-start bg-black overflow-hidden absolute bottom-0 z-10 bg-dark-gradient">
            <div className="flex flex-col text-white">
              <span className="font-semibold">
                {member.name}, {calculateAge(member.dateOfBirth)}
              </span>
              <span className="text-sm">{member.city}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
