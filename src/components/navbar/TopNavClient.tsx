"use client";

import { Navbar, NavbarBrand, NavbarContent, Button } from "@nextui-org/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import NavLink from "./NavLink";
import UserMenu from "./UserMenu";
import FiltersWrapper from "./FiltersWrapper";
import MobileMenu from "./MobileMenu";
import ProfileViewsButton from "../profile-view/ProfileViewsButton";

export default function TopNavClient({
  session,
  userInfo,
  userId,
  links,
  initialUnreadCount,
}: any) {
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
            <span
              className="font-bold tracking-wide text-3xl 
    bg-gradient-to-r from-[#FF9F1C] via-[#FF6A00] to-[#E63946] 
    bg-clip-text text-transparent 
    drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] 
    [text-shadow:_0_1px_0_#000]"
            >
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
        maxWidth="xl"
        className="bg-gradient-to-r from-[#F6D365]/90 via-[#FFB547]/90 to-[#E37B27]/90 backdrop-blur-lg shadow-md border-b border-white/20"
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
        <NavbarBrand className="flex items-center justify-start gap-2 w-full">
          <div className="relative flex items-center justify-center w-11 h-11">
            <Image
              src="/images/icons/Logo.png"
              width={35}
              height={35}
              alt="logo"
              className="object-contain w-auto h-auto"
            />
          </div>

          <Link
            href="/home"
            className="text-white font-bold drop-shadow-md tracking-wide text-3xl"
          >
            Miel
          </Link>
        </NavbarBrand>

        <NavbarContent
          justify="center"
          className="hidden sm:flex gap-6 font-rubik"
        >
          {session &&
            links.map((item: any) => (
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

        <NavbarContent justify="end" className="gap-3 items-center">
          {userInfo ? (
            <>
              <div className="p-2 rounded-full bg-white/20 hover:bg-white/30 shadow-md hover:shadow-lg transition">
                <ProfileViewsButton />
              </div>
              <UserMenu userInfo={userInfo} userId={userId || undefined} />
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
                className="bg-gradient-to-r from-[#FFB547] to-[#E37B27] text-white rounded-full shadow-md hover:shadow-xl transition-all"
              >
                הרשמה
              </Button>
            </div>
          )}
        </NavbarContent>
      </Navbar>

      {!isHomePage && <FiltersWrapper />}
      {session && !isHomePage && <MobileMenu userId={userId} />}
    </>
  );
}
