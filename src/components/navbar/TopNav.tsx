import { getSession } from "@/lib/session";
import {
  getProfileCompletionStatus,
  getUserInfoForNav,
} from "@/app/actions/userActions";
import { getUnreadMessageCount } from "@/app/actions/messageActions";
import { getCurrentUserLocationStatus } from "@/app/actions/memberActions";
import { isActivePremium } from "@/lib/premiumUtils";
import TopNavClient from "./TopNavClient";

export default async function TopNav() {
  const session = await getSession();
  const userInfo = session?.user ? await getUserInfoForNav() : null;
  const userId = session?.user?.id || null;
  const isAdmin = session?.user?.role === "ADMIN";

  let initialUnreadCount = 0;
  if (userId && !isAdmin) {
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
    { href: "/admin", label: "ראשי" },
    { href: "/admin/moderation", label: "אישור תמונות" },
  ];

  const links = isAdmin ? adminLinks : memberLinks;

  const profileCompletion =
    userId && session?.user && !isAdmin
      ? await getProfileCompletionStatus(userId)
      : null;

  const isPremium = isActivePremium(userInfo);

  // Get user location for search functionality
  let userLocation = null;
  if (userId && !isAdmin) {
    try {
      const locationStatus = await getCurrentUserLocationStatus();
      userLocation = locationStatus.coordinates;
    } catch (error) {
      console.warn("Failed to load user location:", error);
    }
  }

  return (
    <TopNavClient
      session={session}
      userInfo={userInfo}
      userId={userId}
      links={links}
      initialUnreadCount={initialUnreadCount}
      profileCompletion={profileCompletion}
      isAdmin={isAdmin}
      isPremium={isPremium}
      userLocation={userLocation}
    />
  );
}
