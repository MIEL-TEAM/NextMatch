import React from "react";
import { getMembers } from "../actions/memberActions";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import MemberCard from "./MemberCard";
import PaginationComponent from "@/components/PaginationComponent";
import { GetMemberParams } from "@/types";
import EmptyState from "@/components/EmptyState";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: GetMemberParams;
}) {
  const params = await searchParams;
  const { items: members, totalCount } = await getMembers(params);
  const likeIds = await fetchCurrentUserLikeIds();

  return (
    <>
      {!members || members.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {members &&
              members?.map((member) => (
                <MemberCard member={member} key={member.id} likeIds={likeIds} />
              ))}
          </div>

          <PaginationComponent totalCount={totalCount} />
        </>
      )}
    </>
  );
}
