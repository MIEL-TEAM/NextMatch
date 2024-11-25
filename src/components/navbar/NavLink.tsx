"use client";

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
  return (
    <NavbarItem as={Link} href={href} isActive={pathName === href}>
      {label}
    </NavbarItem>
  );
}
