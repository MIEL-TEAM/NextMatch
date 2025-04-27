import React from "react";
import { getMembers, getMembersWithPhotos } from "../actions/memberActions";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";
import MembersStylePage from "@/components/memberStyles/MembersPageStyle";

export const metadata = {
  title: "מצאו התאמות חדשות | Miel",
  description:
    "גלו/י פרופילים חדשים ב-Miel, סננו לפי קריטריונים מותאמים אישית, וגלו התאמות פוטנציאליות שיכולות להתאים לכם. הצטרפו עכשיו לחוויית היכרות איכותית, מהירה ומותאמת אישית.",
};

type MembersPageProps = {
  searchParams: Promise<GetMemberParams>;
};

export const revalidate = 60;

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const { items: members, totalCount } = await getMembers(params);
  const likeIds = await fetchCurrentUserLikeIds();

  const isOnlineFilter =
    params.filter === "online" || params.onlineOnly === "true";

  // Optimize photo fetching with batch query
  const memberIds = members.map((member) => member.userId);
  const photosByUserId = await getMembersWithPhotos(memberIds);

  // Map photos to members correctly by user ID, not member ID
  const membersWithPhotos = members.map((member) => ({
    member,
    photos: photosByUserId[member.userId] || [],
  }));

  if (!members || (members.length === 0 && !isOnlineFilter)) {
    return (
      <EmptyState
        message="לא נמצאו תוצאות בטווח הגילאים שבחרת"
        subMessage="נסה/י להרחיב את טווח הגילאים או לשנות את הגדרות הסינון"
        icon
      />
    );
  }

  return (
    <MembersStylePage
      membersData={membersWithPhotos}
      totalCount={totalCount}
      likeIds={likeIds}
      isOnlineFilter={isOnlineFilter}
      noResults={members.length === 0}
    />
  );
}
