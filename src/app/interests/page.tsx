// app/profile/edit/interests/page.tsx
import React from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getSelfProfile } from "@/lib/getSelfProfile";
import EditInterestsClient from "@/components/interests/InterestsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miel - תחומי עניין",
  description: "בחרו תחומי עניין שמתאימים לכם ונגלו התאמות חדשות.",
  openGraph: {
    title: "Miel - תחומי עניין",
    description: "בחרו תחומי עניין שמתאימים לכם ונגלו התאמות חדשות.",
    url: "https://miel-love.com/interests",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "Miel - תחומי עניין",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/interests",
  },
};

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
