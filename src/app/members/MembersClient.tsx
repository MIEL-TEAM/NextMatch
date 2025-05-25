"use client";

import { useSearchParams } from "next/navigation";
import { useMembersQuery } from "@/hooks/useMembersQuery";
import MembersLayout from "@/components/memberStyles/MembersLayout";
import EmptyState from "@/components/EmptyState";
import { fetchCurrentUserLikeIds } from "@/app/actions/likeActions";
import { useEffect, useState } from "react";

export default function MembersClient() {
  const searchParams = useSearchParams();
  const query = useMembersQuery(searchParams);
  const [likeIds, setLikeIds] = useState<string[]>([]);

  useEffect(() => {
    fetchCurrentUserLikeIds().then(setLikeIds);
  }, []);

  if (query.isLoading && !query.isFetchedAfterMount) return null;

  if (query.isError) return <EmptyState message="שגיאה בטעינה" />;

  if (!query.data) return <EmptyState message="שגיאה בטעינה" />;

  const { data, totalCount } = query.data;
  const isOnlineFilter =
    searchParams.get("filter") === "online" ||
    searchParams.get("onlineOnly") === "true";

  if (!data || (data.length === 0 && !isOnlineFilter)) {
    return (
      <EmptyState
        message="לא נמצאו תוצאות בטווח הגילאים שבחרת"
        subMessage="נסה/י להרחיב את טווח הגילאים או לשנות את הגדרות הסינון"
        icon
      />
    );
  }

  return (
    <MembersLayout
      membersData={data}
      totalCount={totalCount}
      likeIds={likeIds}
      isOnlineFilter={isOnlineFilter}
      noResults={data.length === 0}
      hasSeenIntro={true}
    />
  );
}
