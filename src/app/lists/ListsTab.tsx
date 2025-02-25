"use client";

import { Spinner, Tab, Tabs } from "@nextui-org/react";
import { Member } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Key, useTransition } from "react";
import MemberCard from "../members/MemberCard";

type ListsProps = {
  members: Member[];
  likeIds: string[];
};

export default function ListsTab({ members, likeIds }: ListsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const tabs = [
    {
      id: "source",
      label: "החברים שאהבתי",
    },
    {
      id: "target",
      label: "החברים שאהבו אותי",
    },
    {
      id: "mutual",
      label: "לייקים הדדיים",
    },
  ];

  function handleTabChange(key: Key) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", key.toString());
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex w-full flex-col mt-4 md:mt-10 gap-3 md:gap-5 px-2 md:px-4">
      <div className="flex items-center overflow-x-auto">
        <Tabs
          aria-label="Like Tabs"
          color="secondary"
          onSelectionChange={(key) => handleTabChange(key)}
          className="w-full"
          size="sm"
        >
          {tabs.map((item) => (
            <Tab
              key={item.id}
              title={
                <span className="text-xs md:text-sm whitespace-nowrap">
                  {item.label}
                </span>
              }
            />
          ))}
        </Tabs>

        {isPending && (
          <Spinner color="secondary" className="self-center ml-3" size="sm" />
        )}
      </div>

      {tabs.map((item) => {
        const isSelected = searchParams.get("type") === item.id;
        return isSelected ? (
          <div key={item.id} className="w-full">
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    likeIds={likeIds}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-sm md:text-base">
                לייקים (לא בוצעו עדיין).
              </div>
            )}
          </div>
        ) : null;
      })}
    </div>
  );
}
