"use client";

import { useState, useRef } from "react";
import { Button } from "@nextui-org/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";

interface MobileMenuProps {
  links: Array<{ href: string; label: string }>;
  isAuthenticated?: boolean;
}

const MobileMenu = ({ links, isAuthenticated }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Button
        onPress={() => setIsOpen(!isOpen)}
        className="text-[#FFB547] hover:text-[#E37B27] transition duration-300 sm:hidden"
      >
        {isOpen ? <X size={32} /> : <Menu size={32} />}
      </Button>

      <div
        ref={menuRef}
        className={`fixed top-0 right-0 w-64 h-screen bg-white shadow-lg z-50 p-5 transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-6 mt-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-700 hover:text-[#FFB547] transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                className="text-lg font-medium text-gray-700 hover:text-[#FFB547] transition duration-300"
                onClick={() => setIsOpen(false)}
              >
                כניסה
              </Link>
              <Link
                href="/register"
                className="text-lg font-medium text-gray-700 hover:text-[#FFB547] transition duration-300"
                onClick={() => setIsOpen(false)}
              >
                הרשמה
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
