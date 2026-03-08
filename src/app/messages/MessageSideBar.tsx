"use client";

import useConversationStore from "@/store/conversationStore";
import { Card, Chip } from "@nextui-org/react";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Icon, { IconNames } from "@/lib/table/Icon";

export default function MessageSideBar() {
  const unreadCount = useConversationStore((s) => s.globalUnreadCount);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string>(
    searchParams.get("container") || "inbox"
  );
  const items: { key: string; label: string; iconName: IconNames; chip: boolean }[] = [
    { key: "inbox", label: "הודעות שקיבלתי", iconName: "inbox", chip: true },
    { key: "outbox", label: "הודעות ששלחתי", iconName: "inbox-out", chip: false },
    { key: "starred", label: "הודעות מסומנות", iconName: "star-sharp", chip: false },
    { key: "archived", label: "ארכיון", iconName: "box-archive", chip: false },
  ];

  const handleSelect = (key: string) => {
    setSelected(key);
    const params = new URLSearchParams();
    params.set("container", key);
    router.replace(`${pathname}?${params}`);
  };

  return (
    <Card className="shadow-md p-2">
      <div className="flex flex-row md:flex-col cursor-pointer w-full">
        {items.map(({ key, iconName, label, chip }) => (
          <div
            key={key}
            className={clsx(
              "flex flex-1 md:flex-none items-center justify-center md:justify-start rounded-lg md:gap-3 p-3 md:p-4 transition-colors duration-200",
              {
                "bg-secondary/10 text-secondary font-semibold":
                  selected === key,
                "hover:bg-gray-100 text-gray-700": selected !== key,
              }
            )}
            onClick={() => handleSelect(key)}
          >
            <Icon name={iconName} className={clsx("size-5 md:size-[25px]", selected === key ? "bg-secondary" : "bg-gray-700")} />
            <div className="hidden md:flex justify-between flex-row items-center w-full">
              <span>{label}</span>
              {chip && (
                <Chip
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className="mr-1"
                >
                  {Math.max(0, unreadCount)}
                </Chip>
              )}
            </div>

            {chip && (
              <Chip
                color="secondary"
                variant="flat"
                size="sm"
                className="ml-1 md:hidden"
              >
                {unreadCount}
              </Chip>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
