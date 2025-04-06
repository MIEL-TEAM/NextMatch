import { CardBody, CardHeader, Divider } from "@nextui-org/react";
import React from "react";
import EditForm from "./EditForm";
import { getAuthUserId } from "@/app/actions/authActions";
import { getMemberByUserId } from "@/app/actions/memberActions";
import { notFound } from "next/navigation";
import EditableInterestsSection from "@/components/interests/EditableInterestsSection";
import { getMemberInterests } from "@/app/actions/interestsAction";

export default async function MemberEditPage() {
  const userId = await getAuthUserId();
  const member = await getMemberByUserId(userId);

  if (!member) return notFound();

  const interestsResult = await getMemberInterests(member.id);
  const memberInterests =
    interestsResult.status === "success" ? interestsResult.data : [];

  return (
    <>
      <CardHeader className="text-2xl font-semibold text-secondary p-4">
        עריכת פרופיל
      </CardHeader>
      <Divider />
      <CardBody className="text-right p-4">
        <EditForm member={member} />
        <Divider className="my-4" />

        <EditableInterestsSection
          interests={memberInterests}
          userId={userId}
          isEditable={true}
        />
      </CardBody>
    </>
  );
}
