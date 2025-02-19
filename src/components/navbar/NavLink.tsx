"use client";

import useMessageStore from "@/hooks/useMessageStore";
import { NavbarItem } from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavLinkProps = {
  href: string;
  label: string;
};

export default function NavLink({ href, label }: NavLinkProps) {
  const pathName = usePathname();
  const unreadCount = useMessageStore((state) => state.unreadCount);

  return (
    <NavbarItem as={Link} href={href} isActive={pathName === href}>
      <span>{label}</span>
      {href === "/messages" && unreadCount > 0 && (
        <span className="ml-2"> ({unreadCount}) </span>
      )}
    </NavbarItem>
  );
}
