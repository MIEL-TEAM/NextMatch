import { Member } from "@prisma/client";
import { Session } from "next-auth";

export type NavLinkItem = {
  href: string;
  label: string;
  icon?: React.ComponentType<any>;
};

export type NavLinkProps = {
  href: string;
  label: string;
  icon?: React.ComponentType<any>;
};

export type UserInfoForNav = {
  name: string | null;
  image: string | null;
  profileComplete?: boolean;
};

export type TopNavClientProps = {
  session: Session | null;
  userInfo: UserInfoForNav | null;
  unreadCount?: number;
};

export type UserMenuProps = {
  userInfo: {
    name: string | null;
    image: string | null;
  };
};

export type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
};

export type ProfileCompletionButtonProps = {
  status: "incomplete" | "complete" | "loading";
};
