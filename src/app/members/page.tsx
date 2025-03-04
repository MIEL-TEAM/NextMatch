import React from "react";
import { getMembers, getMemberPhotos } from "../actions/memberActions";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import MemberCard from "./MemberCard";
import PaginationComponent from "@/components/PaginationComponent";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";

type MembersPageProps = {
  searchParams: Promise<GetMemberParams>;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const { items: members, totalCount } = await getMembers(params);
  const likeIds = await fetchCurrentUserLikeIds();

  const membersWithPhotos = await Promise.all(
    members.map(async (member) => {
      const photos = await getMemberPhotos(member.userId);
      return { member, photos: photos || [] };
    })
  );

  return (
    <>
      {!members || members.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 sm:p-6">
            {membersWithPhotos?.map(({ member }) => (
              <MemberCard member={member} key={member.id} likeIds={likeIds} />
            ))}
          </div>

          <PaginationComponent totalCount={totalCount} />
        </>
      )}
    </>
  );
}
