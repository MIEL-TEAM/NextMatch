import { getSession } from "@/lib/session";
import {
  getProfileCompletionStatus,
  getUserInfoForNav,
} from "@/app/actions/userActions";
import { getCurrentUserLocationStatus } from "@/app/actions/memberActions";
import { getUnreadMessageCount } from "@/app/actions/messageActions";
import {
  getUnseenNotificationCount,
  getUserNotifications,
} from "@/lib/db/notificationActions";
import { isActivePremium } from "@/lib/premiumUtils";
import TopNavClient from "./TopNavClient";

export default async function TopNav() {
  const session = await getSession();
  const userId = session?.user?.id || null;
  const isAdmin = session?.user?.role === "ADMIN";

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

  // Run all independent DB calls in parallel instead of sequentially.
  const [userInfo, profileCompletion, initialUnreadCount, unseenResult, notifResult, locationStatus] =
    await Promise.all([
      session?.user ? getUserInfoForNav() : Promise.resolve(null),
      userId && session?.user && !isAdmin ? getProfileCompletionStatus(userId) : Promise.resolve(null),
      userId && !isAdmin ? getUnreadMessageCount() : Promise.resolve(0),
      userId && !isAdmin ? getUnseenNotificationCount() : Promise.resolve(null),
      userId && !isAdmin ? getUserNotifications(20, 0) : Promise.resolve(null),
      userId && !isAdmin
        ? getCurrentUserLocationStatus().catch((error) => {
            console.warn("Failed to load user location:", error);
            return { coordinates: null };
          })
        : Promise.resolve({ coordinates: null }),
    ]);

  const isPremium = isActivePremium(userInfo);
  const initialUnseenNotificationCount = unseenResult?.count ?? 0;
  const initialNotifications = (notifResult?.notifications ?? []) as any;
  const userLocation = locationStatus?.coordinates ?? null;

  return (
    <TopNavClient
      session={session}
      userInfo={userInfo}
      userId={userId}
      links={links}
      profileCompletion={profileCompletion}
      isAdmin={isAdmin}
      isPremium={isPremium}
      initialUnreadCount={initialUnreadCount}
      initialUnseenNotificationCount={initialUnseenNotificationCount}
      initialNotifications={initialNotifications}
      userLocation={userLocation}
    />
  );
}
