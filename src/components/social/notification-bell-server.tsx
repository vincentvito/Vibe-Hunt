import { getCurrentUser } from "@/lib/auth-utils";
import {
  getNotifications,
  getUnreadNotificationCount,
} from "@/server/queries/notifications";
import { NotificationBell } from "./notification-bell";

export async function NotificationBellServer() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, 10),
    getUnreadNotificationCount(user.id),
  ]);

  return (
    <NotificationBell
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}
