import { getMemberByUserId } from "@/app/actions/memberActions";
import { ReactNode } from "react";
import MemberSidebar from "../MemberSidebar";
import { notFound } from "next/navigation";
import { Card } from "@nextui-org/react";
import { getAuthUserId } from "@/app/actions/authActions";

export default async function Layout({ children }: { children: ReactNode }) {
  const userId = await getAuthUserId();

  const member = await getMemberByUserId(userId);
  if (!member) return notFound();

  const basePath = `/members/edit`;

  const navLinks = [
    { name: "ערוך פרופיל", href: `${basePath}` },
    { name: "עדכן תמונות", href: `${basePath}/photos` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[80vh] p-4">
      <div className="col-span-1 md:col-span-3">
        <MemberSidebar member={member} navLinks={navLinks} />
      </div>
      <div className="col-span-1 md:col-span-9">
        <Card className="w-full mt-10 h-[80vh] p-4">{children}</Card>
      </div>
    </div>
  );
}
