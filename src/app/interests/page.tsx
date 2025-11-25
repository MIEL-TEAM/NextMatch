// app/profile/edit/interests/page.tsx
import React from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSelfProfile } from "@/lib/getSelfProfile";
import EditInterestsClient from "@/components/interests/InterestsPage";

type EditInterestsPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function EditInterestsPage({
  searchParams,
}: EditInterestsPageProps) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const userId = params.userId || session.user.id;

  const profile = await getSelfProfile(userId);

  if (!profile) {
    throw new Error("Member not found");
  }

  const interests = profile.interests.map((interest) => ({
    id: interest.id,
    name: interest.name,
    icon: interest.icon,
    category: interest.category,
  }));

  return (
    <EditInterestsClient
      userId={userId}
      initialSelectedInterests={interests.map((interest) => interest.id)}
    />
  );
}
