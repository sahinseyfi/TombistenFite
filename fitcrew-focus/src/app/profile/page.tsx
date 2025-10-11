import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchUnreadCount } from "@/lib/app-data";
import { FALLBACK_MEASUREMENTS, FALLBACK_POSTS } from "@/lib/fallback-data";

export default async function ProfilePage() {
  const unreadCount = await fetchUnreadCount();
  const fallbackUser = FALLBACK_POSTS[0]?.author;
  const latestMeasurement = FALLBACK_MEASUREMENTS[0];

  return (
    <MobileLayout title="Profil" notificationCount={unreadCount}>
      <section className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
            {fallbackUser?.avatarUrl && (
              <Image
                src={fallbackUser.avatarUrl}
                alt={`${fallbackUser.name} avatar\u0131`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">{fallbackUser?.name ?? "FitCrew \u00DCyesi"}</p>
            <p className="text-xs">@{fallbackUser?.handle ?? "handle"}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Profili D\u00FCzenle
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">G\u00F6nderi</p>
            <p className="mt-1 text-base font-semibold text-foreground">142</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takip\u00E7i</p>
            <p className="mt-1 text-base font-semibold text-foreground">1\u00A0248</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takip</p>
            <p className="mt-1 text-base font-semibold text-foreground">532</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm">
        <h2 className="text-base font-semibold text-foreground">Son ilerleme</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-primary/10 px-3 py-4">
            <p className="text-xs text-muted-foreground">G\u00FCncel kilo</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {latestMeasurement?.weightKg?.toFixed(1) ?? "68.4"} kg
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/10 px-3 py-4">
            <p className="text-xs text-muted-foreground">Bel \u00E7evresi</p>
            <p className="mt-2 text-2xl font-semibold text-secondary">
              {latestMeasurement?.waistCm ?? 72} cm
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Profiliniz i\u00E7in ki\u015Fiselle\u015Fmi\u015F \u00F6zetler yak\u0131nda burada g\u00F6r\u00FCnecek. \u00D6l\u00E7\u00FCm ve spin verileri
          otomatik olarak senkronize edilecek.
        </p>
      </section>
    </MobileLayout>
  );
}
