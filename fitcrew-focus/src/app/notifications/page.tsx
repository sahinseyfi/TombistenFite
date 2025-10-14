import MobileLayout from "@/components/layout/MobileLayout";
import { fetchNotifications } from "@/lib/app-data";
import NotificationsPanel from "./panel";

export default async function NotificationsPage() {
  const data = await fetchNotifications(20);

  return (
    <MobileLayout title="Bildirimler" notificationCount={data.unreadCount}>
      {data.error === "unauthorized" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Bildirim kutunuza erişebilmek için lütfen hesabınıza giriş yapın.
        </div>
      )}
      {data.error === "unavailable" && (
        <div className="rounded-3xl border border-dashed border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground">
          Bildirimlere şu anda ulaşılamıyor. Lütfen kısa bir süre sonra tekrar deneyin.
        </div>
      )}

      <NotificationsPanel initialNotifications={data.notifications} live={data.live} />
    </MobileLayout>
  );
}

