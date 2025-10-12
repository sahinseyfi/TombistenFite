"use client";

import type { ReactNode } from "react";
import BottomTabBar from "./BottomTabBar";
import Header from "./Header";
import { NotificationProvider } from "./notification-context";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  headerAction?: ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
  hideBottomNav?: boolean;
}

export default function MobileLayout({
  children,
  title,
  headerAction,
  showNotifications = true,
  notificationCount = 0,
  hideBottomNav = false,
}: MobileLayoutProps) {
  return (
    <NotificationProvider initialCount={notificationCount}>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-background">
        <Header title={title} action={headerAction} showNotifications={showNotifications} />

        <main className="flex-1 px-4 pb-[5.5rem] pt-4 sm:px-6">
          <div className="mx-auto max-w-mobile space-y-4 pb-safe">{children}</div>
        </main>

        {!hideBottomNav && <BottomTabBar />}
      </div>
    </NotificationProvider>
  );
}
