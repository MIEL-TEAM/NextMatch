import { CardBody, CardHeader, Divider } from "@nextui-org/react";
import React from "react";
import EditForm from "./EditForm";
import { getAuthUserId } from "@/lib/session";
import { getSelfProfile } from "@/lib/getSelfProfile";
import { notFound } from "next/navigation";

export default async function MemberEditPage() {
  const userId = await getAuthUserId();
  const member = await getSelfProfile(userId);

  if (!member) return notFound();

  return (
    <>
      <CardHeader className="text-2xl font-semibold text-secondary p-4">
        עריכת פרופיל
      </CardHeader>
      <Divider />
      <CardBody className="text-right p-4">
        <EditForm member={member} />
        <Divider className="my-4" />
      </CardBody>
    </>
  );
}
