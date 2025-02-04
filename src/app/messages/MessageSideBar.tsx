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
    <div className="flex flex-col shadow-md rounded0lg cursor-pointer w-52">
      {items.map(({ key, icon: Icon, label, chip }) => (
        <div
          key={key}
          className={clsx("flex flex-row items-center rounded-t-lg gap-2 p-3", {
            "text-secondary font-semibold": selected === key,
            "text-black hover:text-secondary/70": selected !== key,
          })}
          onClick={() => handleSelect(key)}
        >
          <Icon size={25} />
          <div className="flex justify-between flex-row">
            <span>{label}</span>
            {chip && <Chip className="mr-2">{unreadCount}</Chip>}
          </div>
        </div>
      ))}
    </div>
  );
}
