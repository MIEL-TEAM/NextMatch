import { getMemberByUserId } from "@/app/actions/memberActions";
import { ReactNode } from "react";
import MemberSidebar from "../MemberSidebar";
import { notFound } from "next/navigation";
import { Card } from "@nextui-org/react";

type UserLayoutProps = {
  children: ReactNode;
  params: Promise<{ userId: string }>;
};

export default async function Layout({ children, params }: UserLayoutProps) {
  const { userId } = await params;

  const member = await getMemberByUserId(userId);
  if (!member) return notFound();

  const basePath = `/members/${member.userId}`;

  const navLinks = [
    { name: "פרופיל", href: `${basePath}` },
    { name: "צ'אט", href: `${basePath}/chat` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 md:px-4 h-full">
      <div className="hidden md:block w-full md:col-span-3">
        <MemberSidebar member={member} navLinks={navLinks} />
      </div>
      <div className="w-full md:col-span-9 h-full">
        {/* Desktop: Card wrapper with mt-10 */}
        <Card className="hidden md:flex md:flex-col w-full mt-10 md:h-[80vh] shadow-lg overflow-hidden">
          {children}
        </Card>
        {/* Mobile: Card wrapper without margin-top (profile view handles spacing) */}
        <Card className="md:hidden w-full shadow-none border-0">
          {children}
        </Card>
      </div>
    </div>
  );
}
