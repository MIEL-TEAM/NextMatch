"use client";

import useMessageStore from "@/hooks/useMessageStore";
import { Card, Chip } from "@nextui-org/react";
import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { GoInbox } from "react-icons/go";
import { MdOutlineOutbox } from "react-icons/md";

export default function MessageSideBar() {
  const unreadCount = useMessageStore((state) => state.unreadCount);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<string>(
    searchParams.get("container") || "inbox"
  );
  const items = [
    { key: "inbox", label: "הודעות שקיבלתי", icon: GoInbox, chip: true },
    {
      key: "outbox",
      label: "הודעות ששלחתי",
      icon: MdOutlineOutbox,
      chip: false,
    },
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
        {items.map(({ key, icon: Icon, label, chip }) => (
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
            <Icon size={20} className="md:size-[25px]" />
            <div className="hidden md:flex justify-between flex-row items-center w-full">
              <span>{label}</span>
              {chip && (
                <Chip
                  color="secondary"
                  variant="flat"
                  size="sm"
                  className="mr-1"
                >
                  {unreadCount}
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
