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
    { name: "תמונות", href: `${basePath}/photos` },
    { name: "צ'אט", href: `${basePath}/chat` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-5 min-h-screen px-2 md:px-4">
      <div className="w-full md:col-span-3">
        <MemberSidebar member={member} navLinks={navLinks} />
      </div>
      <div className="w-full md:col-span-9">
        <Card className="w-full mt-4 md:mt-10 min-h-[50vh] md:h-[80vh] shadow-lg">
          {children}
        </Card>
      </div>
    </div>
  );
}
