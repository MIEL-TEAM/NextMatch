import React from "react";
import ListsTab from "./ListsTab";
import {
  fetchCurrentUserLikeIds,
  fetchLikedMembers,
} from "../actions/likeActions";

export const dynamic = "force-dynamic";

export default async function ListsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ type: string }>;
}) {
  const searchParams = await searchParamsPromise;

  const likeIds = await fetchCurrentUserLikeIds();
  const members = await fetchLikedMembers(searchParams.type);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 md:px-4 py-2 md:py-4">
      <ListsTab members={members} likeIds={likeIds} />
    </div>
  );
}
