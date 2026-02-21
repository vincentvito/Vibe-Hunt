import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";
import { getNotifications } from "@/server/queries/notifications";
import { NotificationList } from "@/components/social/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const notifications = await getNotifications(user.id, 50);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Bell className="h-6 w-6" />
        Notifications
      </h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
