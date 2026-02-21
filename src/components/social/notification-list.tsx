"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronUp,
  MessageSquare,
  UserPlus,
  Trophy,
  Check,
} from "lucide-react";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/actions/notifications";
import { cn, timeAgo } from "@/lib/utils";
import type { Notification } from "@/server/queries/notifications";

const typeIcons: Record<string, React.ReactNode> = {
  upvote: <ChevronUp className="h-5 w-5 text-primary" />,
  comment: <MessageSquare className="h-5 w-5 text-blue-500" />,
  comment_reply: <MessageSquare className="h-5 w-5 text-blue-500" />,
  new_follower: <UserPlus className="h-5 w-5 text-green-500" />,
  daily_featured: <Trophy className="h-5 w-5 text-yellow-500" />,
};

export function NotificationList({
  notifications: initialNotifications,
}: {
  notifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const hasUnread = notifications.some((n) => !n.isRead);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  function handleNotificationClick(notif: Notification) {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      startTransition(async () => {
        await markNotificationRead(notif.id);
      });
    }
  }

  return (
    <div className="mt-6">
      {hasUnread && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No notifications yet</h2>
          <p className="mt-1 text-muted-foreground">
            When someone upvotes your game, comments, or follows you,
            you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {notifications.map((notif) => {
            const content = (
              <div
                className={cn(
                  "flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/50",
                  !notif.isRead && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="mt-0.5">
                  {typeIcons[notif.type] ?? (
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn("text-sm", !notif.isRead && "font-medium")}
                  >
                    {notif.title}
                  </p>
                  {notif.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notif.body}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} href={notif.link}>
                {content}
              </Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
