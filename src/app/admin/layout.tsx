import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ✅ Uses cached session - deduped with root layout
  const session = await getSession();

  // ✅ Server-side role check
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin-specific layout styling */}
      <div className="container mx-auto py-6">{children}</div>
    </div>
  );
}
