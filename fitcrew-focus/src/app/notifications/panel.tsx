"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useNotificationActions } from "@/components/layout/notification-context";
import { cn } from "@/lib/utils";
import { useNotificationsStream } from "@/hooks/useNotificationsStream";
import type { SerializedNotification } from "@/server/serializers/notification";

type PanelProps = {
  initialNotifications: SerializedNotification[];
  source: "api" | "fallback";
};

const REFRESH_ENDPOINT = "/api/notifications?limit=20";

function formatRelative(dateIso: string) {
  return formatDistanceToNow(new Date(dateIso), {
    addSuffix: true,
    locale: tr,
  });
}

function buildMessage(notification: SerializedNotification) {
  const actorName = notification.actor?.name ?? "Bir kullanıcı";

  switch (notification.type) {
    case "like":
      return `${actorName} gönderinizi beğendi`;
    case "comment":
      return `${actorName} gönderinize yorum bıraktı`;
    case "follow":
      return `${actorName} sizi takip etmeye başladı`;
    case "ai_comment_ready":
      return "AI yorumunuz hazır";
    case "treat_bonus":
      return `${actorName} yeni bonus yürüyüşünüzü tanımladı`;
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

export default function NotificationsPanel({ initialNotifications, source }: PanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [syncing, setSyncing] = useState(false);
  const actions = useNotificationActions();
  const shouldStream = source === "api";

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    actions.setUnreadCount(unreadCount);
  }, [actions, unreadCount]);

  const refreshNotifications = useCallback(async () => {
    if (!shouldStream) {
      return;
    }
    setSyncing(true);
    try {
      const response = await fetch(REFRESH_ENDPOINT, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        notifications?: SerializedNotification[];
        unreadCount?: number;
      };

      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
      if (typeof data.unreadCount === "number") {
        actions.setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Bildirimler yenilenemedi:", error);
    } finally {
      setSyncing(false);
    }
  }, [actions, shouldStream]);

  useNotificationsStream({
    enabled: shouldStream,
    onRefresh: refreshNotifications,
    onUnreadChange: actions.setUnreadCount,
  });

  const handleMarkAllRead = useCallback(() => {
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
    actions.setUnreadCount(0);
  }, [actions]);

  const handleMarkRead = useCallback(
    (id: string) => {
      let changed = false;
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification.id === id && !notification.read) {
            changed = true;
            return {
              ...notification,
              read: true,
              readAt: notification.readAt ?? new Date().toISOString(),
            };
          }
          return notification;
        }),
      );

      if (changed) {
        actions.decrementUnread();
      }
    },
    [actions],
  );

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-muted-foreground/40 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Bildirim kutunuz şu an boş. Yeni etkileşimlerde buraya düşecek.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
          {syncing && <span className="ml-2 text-xs text-muted-foreground/80">· güncelleniyor...</span>}
        </p>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            onClick={handleMarkAllRead}
          >
            Tümünü okundu say
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
                  <p className="text-xs text-muted-foreground">@{notification.actor.handle}</p>
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
