"use client";

import { Navbar, NavbarContent, Button } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import NavLink from "./NavLink";
import UserMenu from "./UserMenu";
import ProfileViewsButton from "../profile-view/ProfileViewsButton";
import ProfileCompletionButton from "./ProfileCompletionButton";
import ChatButton from "./ChatButton";
import UnreadCountSync from "../UnreadCountSync";
import SearchButton from "../search/SearchButton";
import type { TopNavClientProps } from "@/types/navigation";

export default function TopNavClient({
  session,
  userInfo,
  userId,
  links,
  initialUnreadCount,
  profileCompletion,
  isAdmin,
  isPremium,
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
      {!isAdmin && <UnreadCountSync initialUnreadCount={initialUnreadCount} />}
      <Navbar
        maxWidth="full"
        className="bg-gradient-to-r from-[#F6D365]/90 via-[#FFB547]/90 to-[#E37B27]/90 
        backdrop-blur-lg shadow-md border-b border-white/20 z-[100000] relative"
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
          className="w-full justify-between sm:w-auto sm:justify-evenly gap-6 sm:gap-4 items-center px-2 sm:px-0"
        >
          {userInfo ? (
            <>
              {/* Mobile: All icons consistently visible */}
              <div className="sm:hidden w-full flex items-center justify-between gap-2">
                <UserMenu
                  userInfo={userInfo}
                  userId={userId || undefined}
                  isAdmin={isAdmin}
                  isPremium={isPremium}
                  profileCompletion={profileCompletion}
                />
                {!isAdmin && (
                  <>
                    <SearchButton
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md shadow-md border border-white/20"
                    />
                    <ProfileViewsButton />
                    <ChatButton initialUnreadCount={initialUnreadCount} />
                  </>
                )}
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden sm:flex items-center gap-3 sm:gap-5 flex-shrink-0">
                <UserMenu
                  userInfo={userInfo}
                  userId={userId || undefined}
                  isAdmin={isAdmin}
                  isPremium={isPremium}
                  profileCompletion={profileCompletion}
                />
                {!isAdmin && (
                  <>
                    <SearchButton />
                    <ProfileViewsButton />
                  </>
                )}
              </div>
              {profileCompletion && (
                <div className="hidden sm:flex flex-shrink-0">
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
            href="/members"
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
    </>
  );
}
