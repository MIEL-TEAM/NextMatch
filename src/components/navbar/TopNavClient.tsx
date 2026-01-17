"use client";

import { Navbar, NavbarContent, Button } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import NavLink from "./NavLink";
import UserMenu from "./UserMenu";
import FiltersWrapper from "./FiltersWrapper";
import ProfileViewsButton from "../profile-view/ProfileViewsButton";
import ProfileCompletionButton from "./ProfileCompletionButton";
import ChatButton from "./ChatButton";
import type { ProfileCompletionStatus } from "@/types/userAction";

type NavLinkItem = {
  href: string;
  label: string;
};

type UserInfoForNav = {
  name: string | null;
  image: string | null;
};

type TopNavClientProps = {
  session: Session | null;
  userInfo: UserInfoForNav | null;
  userId: string | null;
  links: NavLinkItem[];
  initialUnreadCount: number;
  profileCompletion: ProfileCompletionStatus | null;
  isAdmin: boolean;
};

export default function TopNavClient({
  session,
  userInfo,
  userId,
  links,
  initialUnreadCount,
  profileCompletion,
  isAdmin,
}: TopNavClientProps) {
  const pathname = usePathname();

  const isAuthPage =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/verify-email");

  const isHomePage = pathname === "/" || pathname === "/home";

  if (!pathname) {
    return (
      <div className="bg-gradient-to-r from-[#F6D365]/90 via-[#FFB547]/90 to-[#E37B27]/90 backdrop-blur-lg shadow-md border-b border-white/20 p-4 relative z-50">
        <div className="max-w-xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide text-3xl text-transparent bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] bg-clip-text">
              Miel
            </span>
            <div className="relative flex items-center justify-center w-11 h-11">
              <Image
                src="/images/icons/Logo.png"
                width={35}
                height={35}
                alt="logo"
                className="object-contain w-auto h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <div className="p-4 relative z-50">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-medium text-white/90 tracking-tight">
              Miel
            </span>

            <div className="relative flex w-11 h-11">
              <Image
                src="/images/icons/Logo.png"
                width={35}
                height={35}
                alt="logo"
                className="object-contain w-auto h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isHomePage) {
    return null;
  }

  return (
    <>
      <Navbar
        maxWidth="full"
        className="bg-gradient-to-r from-[#F6D365]/90 via-[#FFB547]/90 to-[#E37B27]/90 
        backdrop-blur-lg shadow-md border-b border-white/20"
        classNames={{
          item: [
            "text-lg",
            "text-white/90",
            "font-medium",
            "relative",
            "transition-all",
            "hover:text-white",
            "after:absolute after:-bottom-2 after:left-0 after:w-0 after:h-[2px] after:bg-yellow-300 after:transition-all hover:after:w-full",
            "data-[active=true]:text-yellow-300 data-[active=true]:after:w-full",
          ],
        }}
      >
        <NavbarContent
          justify="start"
          className="w-full justify-center gap-2.5 sm:w-auto sm:justify-between sm:gap-4 items-center"
        >
          {userInfo ? (
            <>
              <UserMenu
                userInfo={userInfo}
                userId={userId || undefined}
                isAdmin={isAdmin}
              />
              {!isAdmin && <ProfileViewsButton />}
              <div className="sm:hidden">
                <ChatButton initialUnreadCount={initialUnreadCount} />
              </div>
              {profileCompletion && (
                <div className="scale-75 sm:scale-100 -mx-1 sm:mx-0">
                  <ProfileCompletionButton status={profileCompletion} />
                </div>
              )}
            </>
          ) : (
            <div className="hidden sm:flex gap-3">
              <Button
                as={Link}
                href="/login"
                variant="bordered"
                className="text-white hover:border-yellow-300 hover:text-yellow-300 transition"
              >
                כניסה
              </Button>
              <Button
                as={Link}
                href="/register"
                className="bg-gradient-to-r from-[#FFB547] to-[#E37B27] 
                text-white rounded-full shadow-md hover:shadow-xl transition-all"
              >
                הרשמה
              </Button>
            </div>
          )}
        </NavbarContent>

        <NavbarContent
          justify="center"
          className="hidden sm:flex gap-6 font-rubik"
        >
          {session &&
            links.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                initialUnreadCount={
                  item.href === "/messages" ? initialUnreadCount : undefined
                }
              />
            ))}
        </NavbarContent>

        <NavbarContent
          justify="end"
          className="gap-3 items-center hidden sm:flex"
        >
          <Link
            href="/home"
            className="font-bold tracking-wide text-3xl text-[#8B5A2B]"
          >
            Miel
          </Link>

          <div className="relative items-center justify-center w-11 h-11 flex">
            <Image
              src="/images/icons/Logo.png"
              width={35}
              height={35}
              alt="logo"
              className="object-contain w-auto h-auto"
            />
          </div>
        </NavbarContent>
      </Navbar>

      {!isHomePage && <FiltersWrapper />}
    </>
  );
}
