import React from "react";
import { getMembers, getMemberPhotos } from "../actions/memberActions";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";
import MembersStylePage from "@/components/MembersPageStyle";

type MembersPageProps = {
  searchParams: Promise<GetMemberParams>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const { items: members, totalCount } = await getMembers(params);
  const likeIds = await fetchCurrentUserLikeIds();

  const isOnlineFilter =
    params.filter === "online" || params.onlineOnly === "true";

  const membersWithPhotos = await Promise.all(
    members.map(async (member) => {
      const photos = await getMemberPhotos(member.userId);
      return { member, photos: photos || [] };
    })
  );

  if (!members || (members.length === 0 && !isOnlineFilter)) {
    return <EmptyState />;
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
