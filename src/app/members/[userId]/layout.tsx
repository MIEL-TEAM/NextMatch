import { getMemberByUserId } from "@/app/actions/memberActions";
import { ReactNode } from "react";
import MemberSidebar from "../MemberSidebar";
import { notFound } from "next/navigation";
import { Card } from "@nextui-org/react";

type UserLayoutProps = {
  children: ReactNode;
  params: { userId: string };
};

export default async function Layout({ children, params }: UserLayoutProps) {
  const { userId } = await params; 

  const member = await getMemberByUserId(userId);
  if (!member) return notFound();

  return (
    <div className="grid grid-cols-12 gap-5 h-[80vh]">
      <div className="col-span-3">
        <MemberSidebar member={member} />
      </div>
      <div className="col-span-9">
        <Card className="w-full mt-10 h-[80vh]">{children}</Card>
      </div>
    </div>
  );
}
