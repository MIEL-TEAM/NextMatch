import {
  getUnseenNotificationCount,
  getUserNotifications,
} from "@/lib/db/notificationActions";
import type { NotificationDto } from "@/types/notifications";
import ProfileViewsBell from "./ProfileViewsBell";

export default async function ProfileViewsBellWrapper() {
  const [notifResult, unseenResult] = await Promise.all([
    getUserNotifications(20, 0),
    getUnseenNotificationCount(),
  ]);

  // getUserNotifications returns { success: false } when unauthenticated
  if (!notifResult?.success) return null;

  const initialNotifications = (notifResult.notifications ?? []) as NotificationDto[];
  const initialUnseenCount = unseenResult?.count ?? 0;

  return (
    <ProfileViewsBell
      initialNotifications={initialNotifications}
      initialUnseenCount={initialUnseenCount}
    />
  );
}
