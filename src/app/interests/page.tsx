// app/profile/edit/interests/page.tsx
import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMemberByUserId } from "@/app/actions/memberActions";
import { getUserInterestsByUserId } from "@/app/actions/interestsAction";
import EditInterestsClient from "@/components/interests/InterestsPage";

type EditInterestsPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function EditInterestsPage({
  searchParams,
}: EditInterestsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = params.userId || session.user.id;

  const [member, interests] = await Promise.all([
    getMemberByUserId(userId),
    getUserInterestsByUserId(userId),
  ]);

  if (!member) {
    throw new Error("Member not found");
  }

  return (
    <EditInterestsClient
      userId={userId}
      initialSelectedInterests={interests.map((interest) => interest.id)}
    />
  );
}
