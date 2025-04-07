import { getMemberByUserId } from "@/app/actions/memberActions";
import { notFound } from "next/navigation";
import React from "react";
import { Divider } from "@nextui-org/react";
import ProfileHeader from "@/components/ProfileHeader";

import CardInnerWrapper from "@/components/CardInnerWrapper";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";

type MemberDetailedPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function MemberDetailedPage({
  params,
}: MemberDetailedPageProps) {
  const { userId } = await params;
  const member = await getMemberByUserId(userId);
  const likeIds = await fetchCurrentUserLikeIds();

  if (!member) return notFound();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-4">
          <CardInnerWrapper
            header="פרופיל"
            body={<div className="p-4 text-justify">{member.description}</div>}
          />
          <ProfileHeader member={member} userId={userId} likeIds={likeIds} />
          <Divider />
          <h2 className="text-xl font-semibold text-secondary">תחומי עניין</h2>
        </div>
      </div>
    </div>
  );
}
