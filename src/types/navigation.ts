import { Member } from "@prisma/client";
import { Session } from "next-auth";
import type { ProfileCompletionStatus } from "@/types/userAction";

export type NavLinkItem = {
  href: string;
  label: string;
};

export type NavLinkProps = {
  href: string;
  label: string;
  initialUnreadCount?: number;
};

export type UserInfoForNav = {
  name: string | null;
  image: string | null;
};

export type TopNavClientProps = {
  session: Session | null;
  userInfo: UserInfoForNav | null;
  userId: string | null;
  links: NavLinkItem[];
  initialUnreadCount: number;
  profileCompletion: ProfileCompletionStatus | null;
  isAdmin: boolean;
  isPremium: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
};

export type UserMenuProps = {
  userInfo: {
    name: string | null;
    image: string | null;
  } | null;
  userId?: string | undefined;
  isAdmin?: boolean;
  isPremium?: boolean;
  profileCompletion?: ProfileCompletionStatus | null;
};

export type ChatButtonProps = {
  initialUnreadCount: number;
};

export type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
};
