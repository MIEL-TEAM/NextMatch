"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Heart, User } from "lucide-react";

const MobileNav = ({ userId }: { userId: string | null }) => {
  const pathname = usePathname();
  const profileLink = userId ? `/members/${userId}` : "/login";

  return (
    <nav className="fixed z-50 bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-200 flex justify-around items-center p-3 sm:hidden">
      <Link
        href="/members"
        className={`flex flex-col items-center ${
          pathname === "/members" ? "text-[#FFB547]" : "text-gray-600"
        } hover:text-[#FFB547]`}
      >
        <Home size={24} />
        <span className="text-xs">ראשי</span>
      </Link>

      <Link
        href="/lists"
        className={`flex flex-col items-center ${
          pathname === "/lists" ? "text-[#FFB547]" : "text-gray-600"
        } hover:text-[#FFB547]`}
      >
        <Heart size={24} />
        <span className="text-xs">רשימות</span>
      </Link>

      <Link
        href="/messages"
        className={`flex flex-col items-center ${
          pathname === "/messages" ? "text-[#FFB547]" : "text-gray-600"
        } hover:text-[#FFB547]`}
      >
        <MessageCircle size={24} />
        <span className="text-xs">הודעות</span>
      </Link>

      <Link
        href={profileLink}
        className={`flex flex-col items-center ${
          pathname === profileLink ? "text-[#FFB547]" : "text-gray-600"
        } hover:text-[#FFB547]`}
      >
        <User size={24} />
        <span className="text-xs">פרופיל</span>
      </Link>
    </nav>
  );
};

export default MobileNav;
