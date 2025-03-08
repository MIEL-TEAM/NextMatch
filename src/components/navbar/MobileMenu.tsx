"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Heart, User } from "lucide-react";
import { memo } from "react";

const baseStyles =
  "flex flex-col items-center text-gray-600 hover:text-[#FFB547] transition-colors duration-150";
const activeStyles =
  "flex flex-col items-center text-[#FFB547] transition-colors duration-150";

const NavItem = memo(
  ({
    href,
    isActive,
    icon: Icon,
    label,
  }: {
    href: string;
    isActive: boolean;
    icon: typeof Home;
    label: string;
  }) => (
    <Link
      href={href}
      className={isActive ? activeStyles : baseStyles}
      prefetch={true}
    >
      <Icon size={24} />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
);

NavItem.displayName = "NavItem";

const MobileNav = ({ userId }: { userId: string | null }) => {
  const pathname = usePathname();
  const profileLink = userId ? `/members/${userId}` : "/login";

  return (
    <nav className="fixed z-50 bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200 flex justify-around items-center p-3 sm:hidden will-change-transform">
      <NavItem
        href="/members"
        isActive={pathname === "/members"}
        icon={Home}
        label="ראשי"
      />

      <NavItem
        href="/lists"
        isActive={pathname === "/lists"}
        icon={Heart}
        label="רשימות"
      />

      <NavItem
        href="/messages"
        isActive={pathname === "/messages"}
        icon={MessageCircle}
        label="הודעות"
      />

      <NavItem
        href={profileLink}
        isActive={pathname === profileLink}
        icon={User}
        label="פרופיל"
      />
    </nav>
  );
};

export default memo(MobileNav);
