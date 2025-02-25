"use client";

import PresenceDot from "@/components/PresenceDot";
import { calculateAge } from "@/lib/util";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Image,
} from "@nextui-org/react";
import { Member } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MemberSidebarProps = {
  member: Member;
  navLinks: { name: string; href: string }[];
};

export default function MemberSidebar({
  member,
  navLinks,
}: MemberSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Card className="w-full mt-4 md:mt-10 items-center bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] h-auto md:h-[80vh] shadow-lg">
      <button
        onClick={toggleMobileMenu}
        className="md:hidden w-full py-2 flex justify-center items-center"
      >
        <span className="text-white font-bold">{member.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-transform duration-200 ml-2 ${
            isMobileMenuOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`w-full flex flex-col items-center transition-all duration-300 ${
          isMobileMenuOpen
            ? "max-h-screen"
            : "max-h-0 md:max-h-screen overflow-hidden"
        }`}
      >
        <Image
          height={150}
          width={150}
          src={member.image || "/images/user.png"}
          alt="User profile main image"
          className="rounded-full mt-4 md:mt-6 aspect-square object-cover border-4 border-white shadow-md"
        />

        <CardBody className="w-full">
          <div className="flex flex-col items-center">
            <div className="flex">
              <PresenceDot member={member} />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {member.name}, {calculateAge(member.dateOfBirth)}
            </div>
            <div className="text-sm text-white/80">
              {member.city}, {member.country}
            </div>
          </div>
          <Divider className="my-3 bg-white/20" />
          <nav className="flex flex-col text-center p-2 md:p-4 text-xl md:text-2xl gap-2 md:gap-4">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.name}
                className={`block rounded py-2 px-4 transition-colors duration-200 ${
                  pathname === link.href
                    ? "bg-white/20 text-white font-bold"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </CardBody>
        <CardFooter className="w-full pb-4">
          <Button
            as={Link}
            href="/members"
            fullWidth
            className="bg-white text-[#E37B27] hover:bg-white/90 font-bold"
            onPress={() => setIsMobileMenuOpen(false)}
          >
            חזרה לדף הקודם
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
