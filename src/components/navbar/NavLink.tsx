"use client";

import useConversationStore from "@/store/conversationStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { NavLinkProps } from "@/types/navigation";

export default function NavLink({ href, label }: NavLinkProps) {
  const pathName = usePathname();
  const unreadCount = useConversationStore((s) => s.globalUnreadCount);

  const isActive = pathName === href;

  return (
    <li className="list-none">
      <Link
        href={href}
        className={`
    transition-all duration-200
    text-lg font-semibold

    ${isActive ? "text-[#8B5A2B]" : "text-white hover:text-white/70"}
  `}
      >
        {label}

        {unreadCount > 0 && href === "/messages" && (
          <span
            className={`ml-2 ${isActive ? "text-[#8B5A2B]" : "text-white"}`}
          >
            ({unreadCount})
          </span>
        )}
      </Link>
    </li>
  );
}
