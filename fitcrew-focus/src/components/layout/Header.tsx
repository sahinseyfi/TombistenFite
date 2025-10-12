import type { ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationState } from "./notification-context";

interface HeaderProps {
  title?: string;
  action?: ReactNode;
  showNotifications?: boolean;
}

export default function Header({
  title = "FitCrew",
  action,
  showNotifications = true,
}: HeaderProps) {
  const { unreadCount } = useNotificationState();
  const hasUnread = unreadCount > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-mobile items-center justify-between px-4 pb-2 pt-safe">
        <h1 className="text-2xl font-display font-semibold text-foreground">
          <span className="gradient-primary bg-clip-text text-transparent">{title}</span>
        </h1>

        <div className="flex items-center gap-2">
          {action}
          {showNotifications && (
            <Link
              href={{ pathname: "/notifications" }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-card/60 text-foreground shadow-sm transition hover:bg-card"
              aria-label={hasUnread ? `Bildirimler (${unreadCount})` : "Bildirimler"}
            >
              <Bell className="h-5 w-5" aria-hidden />
              {hasUnread && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px]"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
