"use client";

import useMessageStore from "@/hooks/useMessageStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavLinkProps = {
  href: string;
  label: string;
  initialUnreadCount?: number;
};

export default function NavLink({
  href,
  label,
  initialUnreadCount,
}: NavLinkProps) {
  const pathName = usePathname();
  const storeUnreadCount = useMessageStore((state) => state.unreadCount);
  const unreadCount = storeUnreadCount || initialUnreadCount || 0;

  return (
    <li className="list-none">
      <Link
        href={href}
        className={`text-white hover:text-yellow-200 transition-all duration-300 text-lg font-medium relative group ${
          pathName === href ? "text-yellow-300" : ""
        }`}
      >
        <span className="relative z-10">{label}</span>
        {unreadCount > 0 && href === "/messages" && (
          <span className="ml-2 relative z-10"> ({unreadCount}) </span>
        )}

        <span
          className={`absolute bottom-0 left-1/2 w-0 h-0.5 bg-white transform -translate-x-1/2 transition-all duration-300 group-hover:w-full ${
            pathName === href ? "w-full" : ""
          }`}
        />
      </Link>
    </li>
  );
}
