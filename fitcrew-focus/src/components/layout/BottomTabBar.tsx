"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleDashed, Home, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationState } from "./notification-context";

type TabConfig = {
  name: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isAction?: boolean;
  withBadge?: boolean;
};

const tabs: TabConfig[] = [
  { name: "Ak\u0131\u015F", icon: Home, href: "/feed" },
  { name: "\u0130lerleme", icon: TrendingUp, href: "/insights" },
  { name: "\u00C7ark", icon: CircleDashed, href: "/treats", isAction: true },
  { name: "Bildirimler", icon: Bell, href: "/notifications", withBadge: true },
  { name: "Profil", icon: User, href: "/profile" },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { unreadCount } = useNotificationState();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex h-16 max-w-mobile items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          const showBadge = tab.withBadge && unreadCount > 0;

          return (
            <Link
              key={tab.href}
              href={{ pathname: tab.href }}
              className={cn(
                "relative flex min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                tab.isAction
                  ? "gradient-primary text-primary-foreground shadow-glow scale-105"
                  : isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-6 w-6", tab.isAction && "h-7 w-7")} aria-hidden />
              <span className="text-[10px] font-semibold tracking-wide">{tab.name}</span>

              {showBadge && (
                <span className="absolute -top-1 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
