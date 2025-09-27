import { auth } from "@/auth";
import { getUserInfoForNav } from "@/app/actions/userActions";
import { getUnreadMessageCount } from "@/app/actions/messageActions";
import TopNavClient from "./TopNavClient";

export default async function TopNav() {
  const session = await auth();
  const userInfo = session?.user && (await getUserInfoForNav());
  const userId = session?.user?.id || null;

  let initialUnreadCount = 0;
  if (session?.user?.id) {
    try {
      initialUnreadCount = await getUnreadMessageCount();
    } catch (error) {
      console.warn("Failed to load initial unread count:", error);
    }
  }

  const memberLinks = [
    { href: "/members", label: "אנשים" },
    { href: "/smart-matches", label: "חיבורים חכמים" },
    { href: "/lists", label: "התאמות" },
    { href: "/messages", label: "הודעות" },
    { href: "/premium", label: "פרימיום" },
  ];

  const adminLinks = [
    { href: "/admin/moderation", label: "מתן תמונה למתן אישור" },
  ];

  const links = session?.user?.role === "ADMIN" ? adminLinks : memberLinks;

  return (
    <TopNavClient
      session={session}
      userInfo={userInfo}
      userId={userId}
      links={links}
      initialUnreadCount={initialUnreadCount}
    />
  );
}
