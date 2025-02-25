"use client";

import useMessageStore from "@/hooks/useMessageStore";
import { Chip } from "@nextui-org/react";
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
    <div className="flex flex-row md:flex-col shadow-md rounded-lg cursor-pointer w-full md:w-52 mb-4 md:mb-0">
      {items.map(({ key, icon: Icon, label, chip }) => (
        <div
          key={key}
          className={clsx(
            "flex flex-1 md:flex-none items-center justify-center md:justify-start rounded-t-lg md:gap-2 p-2 md:p-3",
            {
              "text-secondary font-semibold": selected === key,
              "text-black hover:text-secondary/70": selected !== key,
            }
          )}
          onClick={() => handleSelect(key)}
        >
          <Icon size={20} className="md:size-[25px]" />
          <div className="hidden md:flex justify-between flex-row">
            <span>{label}</span>
            {chip && <Chip className="mr-2">{unreadCount}</Chip>}
          </div>
          {/* Mobile chip */}
          {chip && <Chip className="ml-1 md:hidden">{unreadCount}</Chip>}
        </div>
      ))}
    </div>
  );
}
