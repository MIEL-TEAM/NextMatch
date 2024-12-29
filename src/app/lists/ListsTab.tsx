"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { Member } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Key } from "react";
import MemberCard from "../members/MemberCard";

type ListsProps = {
  members: Member[];
  likeIds: string[];
};

export default function ListsTab({ members, likeIds }: ListsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabs = [
    {
      id: "source",
      label: "Member I have liked",
    },
    {
      id: "target",
      label: "Member That liked me",
    },
    {
      id: "mutual",
      label: "Mutual likes",
    },
  ];

  function handleTabChange(key: Key) {
    const params = new URLSearchParams(searchParams);
    params.set("type", key.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex w-full flex-col mt-10 gap-5">
      <Tabs
        aria-label="Like Tabs"
        items={tabs}
        color="secondary"
        onSelectionChange={(key) => handleTabChange(key)}
      >
        {(item) => (
          <Tab key={item.id} title={item.label}>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    likeIds={likeIds}
                  />
                ))}
              </div>
            ) : (
              <div>no members</div>
            )}
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
