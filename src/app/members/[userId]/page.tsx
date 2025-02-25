import { getMemberByUserId } from "@/app/actions/memberActions";
import CardInnerWrapper from "@/components/CardInnerWrapper";
import { notFound } from "next/navigation";
import React from "react";

type MemberDetailedPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function MemberDetailedPage({
  params,
}: MemberDetailedPageProps) {
  const { userId } = await params;

  const member = await getMemberByUserId(userId);

  if (!member) return notFound();

  return (
    <CardInnerWrapper
      header="פרופיל"
      body={<div className="p-4 text-justify">{member.description}</div>}
    />
  );
}
