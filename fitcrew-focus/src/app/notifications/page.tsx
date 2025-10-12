import MobileLayout from "@/components/layout/MobileLayout";
import { fetchNotifications } from "@/lib/app-data";
import NotificationsPanel from "./panel";

export default async function NotificationsPage() {
  const data = await fetchNotifications(20);

  return (
    <MobileLayout title="Bildirimler" notificationCount={data.unreadCount}>
      {data.source === "fallback" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Deneme bildirimlerini görüyorsunuz. Kendi bildirimlerinizi takip edebilmek için lütfen giriş yapın.
        </div>
      )}

      <NotificationsPanel initialNotifications={data.notifications} source={data.source} />
    </MobileLayout>
  );
}

