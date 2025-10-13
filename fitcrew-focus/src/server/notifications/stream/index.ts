type NotificationStreamEvent =
  | { type: "refresh" }
  | { type: "unread"; unreadCount: number }
  | { type: "ping" };

type Subscriber = (event: NotificationStreamEvent) => void;

const subscribers = new Map<string, Set<Subscriber>>();

function getChannel(userId: string) {
  let channel = subscribers.get(userId);
  if (!channel) {
    channel = new Set<Subscriber>();
    subscribers.set(userId, channel);
  }
  return channel;
}

export function subscribeNotifications(userId: string, subscriber: Subscriber): () => void {
  const channel = getChannel(userId);
  channel.add(subscriber);

  return () => {
    const target = subscribers.get(userId);
    if (!target) {
      return;
    }
    target.delete(subscriber);
    if (target.size === 0) {
      subscribers.delete(userId);
    }
  };
}

export function emitNotificationEvent(userId: string, event: NotificationStreamEvent) {
  const channel = subscribers.get(userId);
  if (!channel || channel.size === 0) {
    return;
  }

  for (const subscriber of channel) {
    try {
      subscriber(event);
    } catch (error) {
      console.error("Bildirim SSE aboneliği başarısız oldu:", error);
    }
  }
}

export function emitUnreadCount(userId: string, unreadCount: number) {
  emitNotificationEvent(userId, { type: "unread", unreadCount });
}

export function emitRefresh(userId: string) {
  emitNotificationEvent(userId, { type: "refresh" });
}

export function emitPing(userId: string) {
  emitNotificationEvent(userId, { type: "ping" });
}

export type { NotificationStreamEvent };
