import React from "react";
import { getMembers } from "../actions/memberActions";
import { fetchCurrentUserLikeIds } from "../actions/likeActions";
import MemberCard from "./MemberCard";

export default async function MembersPage() {
  const members = await getMembers();
  const likeIds = await fetchCurrentUserLikeIds();

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
      {members &&
        members?.map((member) => (
          <MemberCard member={member} key={member.id} likeIds={likeIds} />
        ))}
    </div>
  );
}
