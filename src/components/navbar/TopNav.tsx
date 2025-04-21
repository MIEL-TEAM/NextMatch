import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Link,
  Button,
} from "@nextui-org/react";
import Image from "next/image";

import NavLink from "./NavLink";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import { getUserInfoForNav } from "@/app/actions/userActions";
import FiltersWrapper from "./FiltersWrapper";
import MobileNav from "./MobileMenu";

export default async function TopNav() {
  const session = await auth();
  const userInfo = session?.user && (await getUserInfoForNav());
  const userId = session?.user?.id || null;

  const memberLinks = [
    { href: "/members", label: "אנשים" },
    { href: "/smart-matches", label: "חיבורים חכמים" },
    { href: "/lists", label: "קשרים" },
    { href: "/messages", label: "הודעות" },
    { href: "/premium", label: "פרימיום" },
  ];

  const adminLinks = [
    { href: "/admin/moderation", label: "מתן תמונה למתן אישור" },
  ];

  const links = session?.user?.role === "ADMIN" ? adminLinks : memberLinks;

  return (
    <>
      <Navbar
        maxWidth="xl"
        className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27]"
        classNames={{
          item: [
            "text-xl",
            "text-white",
            "uppercase",
            "data-[active=true]:text-yellow-200",
          ],
          brand: "",
          content: "",
        }}
      >
        <NavbarBrand as={Link} href="/" className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/20 backdrop-blur-md shadow-xl border border-white/30 transition-all duration-[1500ms] ease-out hover:shadow-2xl">
            <Image
              src="/images/icons/Logo.png"
              width={35}
              height={35}
              alt="logo png"
              className="object-contain animate-bounce-slow transition-transform duration-[2000ms] ease-in-out hover:scale-105 w-auto h-auto"
            />
          </div>

          <div className="ml-4 font-bold text-3xl flex">
            <span className="text-white font-reddit font-normal drop-shadow-md tracking-wide m-4">
              Miel
            </span>
          </div>
        </NavbarBrand>

        <NavbarContent
          className="hidden sm:flex gap-4 font-rubik"
          justify="center"
        >
          {session &&
            links.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          {userInfo ? (
            <>
              <UserMenu userInfo={userInfo} userId={userId || undefined} />
            </>
          ) : (
            <>
              <div className="hidden sm:flex gap-2">
                <Button
                  as={Link}
                  href="/login"
                  variant="bordered"
                  className="text-white"
                >
                  כניסה
                </Button>
                <Button
                  as={Link}
                  href="/register"
                  variant="bordered"
                  className="text-white"
                >
                  הרשמה
                </Button>
              </div>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <FiltersWrapper />

      {session && <MobileNav userId={userId} />}
    </>
  );
}
