"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NotificationState = {
  unreadCount: number;
};

type NotificationActions = {
  setUnreadCount: (count: number) => void;
  decrementUnread: (amount?: number) => void;
};

const NotificationStateContext = createContext<NotificationState | undefined>(undefined);
const NotificationActionsContext = createContext<NotificationActions | undefined>(undefined);

function clamp(count: number) {
  return count < 0 ? 0 : count;
}

export function NotificationProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: ReactNode;
}) {
  const [unreadCount, setUnreadCountInternal] = useState(() => clamp(initialCount));

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountInternal(clamp(count));
  }, []);

  const decrementUnread = useCallback((amount = 1) => {
    setUnreadCountInternal((prev) => clamp(prev - amount));
  }, []);

  const state = useMemo<NotificationState>(() => ({ unreadCount }), [unreadCount]);
  const actions = useMemo<NotificationActions>(
    () => ({
      setUnreadCount,
      decrementUnread,
    }),
    [setUnreadCount, decrementUnread],
  );

  return (
    <NotificationStateContext.Provider value={state}>
      <NotificationActionsContext.Provider value={actions}>
        {children}
      </NotificationActionsContext.Provider>
    </NotificationStateContext.Provider>
  );
}

export function useNotificationState(): NotificationState {
  const value = useContext(NotificationStateContext);
  if (!value) {
    throw new Error("NotificationProvider eksik: useNotificationState yaln\u0131zca sa\u011Flay\u0131c\u0131 i\u00E7inde \u00E7a\u011Fr\u0131lmal\u0131.");
  }
  return value;
}

export function useNotificationActions(): NotificationActions {
  const value = useContext(NotificationActionsContext);
  if (!value) {
    throw new Error("NotificationProvider eksik: useNotificationActions yaln\u0131zca sa\u011Flay\u0131c\u0131 i\u00E7inde \u00E7a\u011Fr\u0131lmal\u0131.");
  }
  return value;
}
