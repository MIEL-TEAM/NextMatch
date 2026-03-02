import { Member } from "@prisma/client";
import { Session } from "next-auth";
import type { ProfileCompletionStatus } from "@/types/userAction";
import type { NotificationDto } from "@/types/notifications";

export type NavLinkItem = {
  href: string;
  label: string;
};

export type NavLinkProps = {
  href: string;
  label: string;
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
  profileCompletion: ProfileCompletionStatus | null;
  isAdmin: boolean;
  isPremium: boolean;
  initialUnreadCount: number;
  initialUnseenNotificationCount: number;
  initialNotifications: NotificationDto[];
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


export type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
};
