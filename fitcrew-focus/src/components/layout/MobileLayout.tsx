"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { ReactNode } from "react";
import type { MembershipSnapshot } from "@/types/membership";
import { FALLBACK_MEMBERSHIP } from "@/lib/fallback-data";
import BottomTabBar from "./BottomTabBar";
import Header from "./Header";
import { NotificationProvider } from "./notification-context";
import { MembershipProvider } from "./membership-context";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  headerAction?: ReactNode;
  showNotifications?: boolean;
  notificationCount?: number;
  hideBottomNav?: boolean;
  membership?: MembershipSnapshot;
}

export default function MobileLayout({
  children,
  title,
  headerAction,
  showNotifications = true,
  notificationCount = 0,
  hideBottomNav = false,
  membership,
}: MobileLayoutProps) {
  const resolvedMembership = membership ?? FALLBACK_MEMBERSHIP;

  let resolvedAction = headerAction;
  if (resolvedAction === undefined && resolvedMembership.tier === "free") {
    resolvedAction = <PremiumUpsellButton />;
  }

  return (
    <MembershipProvider initialMembership={resolvedMembership}>
      <NotificationProvider initialCount={notificationCount}>
        <div className="relative mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-background">
          <Header title={title} action={resolvedAction} showNotifications={showNotifications} />

          <main className="flex-1 px-4 pb-[5.5rem] pt-4 sm:px-6">
            <div className="mx-auto max-w-mobile space-y-4 pb-safe">
              {children}
            </div>
          </main>

          {!hideBottomNav && <BottomTabBar />}
        </div>
      </NotificationProvider>
    </MembershipProvider>
  );
}

function PremiumUpsellButton() {
  return (
    <Link
      href={{ pathname: "/premium" }}
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-primary/70 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
    >
      <Crown className="h-4 w-4" aria-hidden />
      Premium
    </Link>
  );
}
