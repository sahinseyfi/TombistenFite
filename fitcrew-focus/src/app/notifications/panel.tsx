"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useNotificationActions } from "@/components/layout/notification-context";
import { cn } from "@/lib/utils";
import type { SerializedNotification } from "@/server/serializers/notification";

type PanelProps = {
  initialNotifications: SerializedNotification[];
  source: "api" | "fallback";
};

function formatRelative(dateIso: string) {
  return formatDistanceToNow(new Date(dateIso), {
    addSuffix: true,
    locale: tr,
  });
}

function buildMessage(notification: SerializedNotification) {
  const actorName = notification.actor?.name ?? "Bir kullan\u0131c\u0131";

  switch (notification.type) {
    case "like":
      return `${actorName} g\u00F6nderinizi be\u011Fendi`;
    case "comment":
      return `${actorName} g\u00F6nderinize yorum b\u0131rakt\u0131`;
    case "follow":
      return `${actorName} sizi takip etmeye ba\u015Flad\u0131`;
    case "ai_comment_ready":
      return "AI yorumunuz haz\u0131r";
    case "treat_bonus":
      return `${actorName} yeni bonus y\u00FCr\u00FCy\u00FC\u015F\u00FCn\u00FCz\u00FC tan\u0131mlad\u0131`;
    default:
      return "Yeni bildirim";
  }
}

function resolveIcon(type: string) {
  switch (type) {
    case "like":
      return <Heart className="h-4 w-4 text-destructive" aria-hidden />;
    case "comment":
      return <MessageCircle className="h-4 w-4 text-primary" aria-hidden />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-success" aria-hidden />;
    case "ai_comment_ready":
      return <Bell className="h-4 w-4 text-secondary" aria-hidden />;
    case "treat_bonus":
      return <Bell className="h-4 w-4 text-warning" aria-hidden />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" aria-hidden />;
  }
}

export default function NotificationsPanel({ initialNotifications }: PanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const actions = useNotificationActions();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    actions.setUnreadCount(unreadCount);
  }, [actions, unreadCount]);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.read
          ? notification
          : {
              ...notification,
              read: true,
              readAt: new Date().toISOString(),
            },
      ),
    );
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
              readAt: notification.readAt ?? new Date().toISOString(),
            }
          : notification,
      ),
    );
  };

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Bildirim kutunuz \u015Fu an bo\u015F. Yeni etkile\u015Fimlerde buraya d\u00FC\u015Fecek.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} okunmam\u0131\u015F bildirim` : "T\u00FCm bildirimler okundu"}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            onClick={handleMarkAllRead}
          >
            T\u00FCm\u00FCn\u00FC okundu say
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {notifications.map((notification) => {
          const isUnread = !notification.read;
          const message = buildMessage(notification);

          return (
            <li
              key={notification.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border border-border p-4 text-sm",
                isUnread ? "bg-primary/5" : "bg-card",
              )}
            >
              <div className="mt-0.5">{resolveIcon(notification.type)}</div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{message}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(notification.createdAt)}
                  </span>
                </div>
                {notification.actor && (
                  <p className="text-xs text-muted-foreground">
                    @{notification.actor.handle}
                  </p>
                )}
              </div>
              {isUnread && (
                <button
                  type="button"
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  onClick={() => handleMarkRead(notification.id)}
                >
                  Okundu
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
