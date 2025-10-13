"use client";

import { useCallback, useEffect, useRef } from "react";

type UseNotificationsStreamOptions = {
  enabled?: boolean;
  onRefresh?: () => Promise<void> | void;
  onUnreadChange?: (count: number) => void;
  pollIntervalMs?: number;
};

type StreamPayload =
  | { type: "connected"; unreadCount: number }
  | { type: "refresh" }
  | { type: "unread"; unreadCount: number }
  | { type: "ping"; ts: number };

export function useNotificationsStream(options: UseNotificationsStreamOptions) {
  const { enabled = true, onRefresh, onUnreadChange, pollIntervalMs = 30_000 } = options;
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (typeof onRefresh === "function") {
      await onRefresh();
    }
  }, [onRefresh]);

  const scheduleFallbackPoll = useCallback(() => {
    if (!pollIntervalMs) {
      return;
    }
    clearPollTimer();
    pollTimer.current = setTimeout(async () => {
      await triggerRefresh();
      scheduleFallbackPoll();
    }, pollIntervalMs);
  }, [clearPollTimer, pollIntervalMs, triggerRefresh]);

  useEffect(() => {
    if (!enabled) {
      clearPollTimer();
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      return;
    }

    function handleMessage(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as StreamPayload;
        if (payload.type === "refresh") {
          void triggerRefresh();
        } else if (payload.type === "unread" && typeof onUnreadChange === "function") {
          onUnreadChange(payload.unreadCount);
        } else if (payload.type === "connected") {
          if (typeof onUnreadChange === "function") {
            onUnreadChange(payload.unreadCount);
          }
        }
      } catch (error) {
        console.error("Bildirim SSE verisi parse edilemedi:", error);
      }
    }

    function handleError() {
      console.warn("SSE bağlantısı kesildi, fallback poll devreye giriyor.");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      scheduleFallbackPoll();
    }

    clearPollTimer();

    const source = new EventSource("/api/notifications/stream");
    source.onmessage = handleMessage;
    source.onerror = handleError;

    eventSourceRef.current = source;

    return () => {
      source.close();
      eventSourceRef.current = null;
      clearPollTimer();
    };
  }, [enabled, clearPollTimer, triggerRefresh, onUnreadChange, scheduleFallbackPoll]);
}
