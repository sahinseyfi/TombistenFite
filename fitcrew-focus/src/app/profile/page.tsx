import Link from "next/link";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchReferrals, fetchUnreadCount } from "@/lib/app-data";
import { FALLBACK_MEASUREMENTS, FALLBACK_POSTS } from "@/lib/fallback-data";

function formatDateLabel(iso: string | null) {
  if (!iso) {
    return "Henüz davet yok";
  }

  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function ProfilePage() {
  const [unreadCount, referrals] = await Promise.all([fetchUnreadCount(), fetchReferrals()]);
  const fallbackUser = FALLBACK_POSTS[0]?.author;
  const latestMeasurement = FALLBACK_MEASUREMENTS[0];
  const { summary, analytics } = referrals;
  const conversionPercent = Math.round((analytics.conversionRate || 0) * 100);
  const pendingPercent = Math.round((analytics.pendingRate || 0) * 100);

  return (
    <MobileLayout title="Profil" notificationCount={unreadCount}>
      <section className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
            {fallbackUser?.avatarUrl && (
              <Image
                src={fallbackUser.avatarUrl}
                alt={`${fallbackUser.name} avatarı`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">{fallbackUser?.name ?? "FitCrew Üyesi"}</p>
            <p className="text-xs">@{fallbackUser?.handle ?? "handle"}</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            Profili Düzenle
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Gönderi</p>
            <p className="mt-1 text-base font-semibold text-foreground">142</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takipçi</p>
            <p className="mt-1 text-base font-semibold text-foreground">1 248</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takip</p>
            <p className="mt-1 text-base font-semibold text-foreground">532</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Davet performansı</h2>
            <p className="text-xs text-muted-foreground">
              Kod: <span className="font-semibold text-foreground">{referrals.referral.code}</span>
            </p>
          </div>
          <Link
            href={referrals.referral.shareUrl}
            target="_blank"
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Davet bağlantısı
          </Link>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-2xl bg-primary/10 px-3 py-3">
            <p className="text-muted-foreground">Toplam</p>
            <p className="mt-1 text-lg font-semibold text-primary">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-success/10 px-3 py-3">
            <p className="text-muted-foreground">Kabul</p>
            <p className="mt-1 text-lg font-semibold text-success">{summary.accepted}</p>
          </div>
          <div className="rounded-2xl bg-warning/10 px-3 py-3">
            <p className="text-muted-foreground">Beklemede</p>
            <p className="mt-1 text-lg font-semibold text-warning">{summary.pending}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-2xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Dönüş oranı</p>
            <p className="mt-2 text-lg font-semibold text-foreground">%{conversionPercent}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Beklemede: %{pendingPercent} • Waitlist opt-in: {analytics.waitlistOptIns}
            </p>
          </div>
          <div className="rounded-2xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Bu hafta</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {analytics.sentThisWeek} gönderim / {analytics.acceptedThisWeek} kabul
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Son davet: {formatDateLabel(analytics.lastInviteSentAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm">
        <h2 className="text-base font-semibold text-foreground">Son ilerleme</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-primary/10 px-3 py-4">
            <p className="text-xs text-muted-foreground">Güncel kilo</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {latestMeasurement?.weightKg?.toFixed(1) ?? "68.4"} kg
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/10 px-3 py-4">
            <p className="text-xs text-muted-foreground">Bel çevresi</p>
            <p className="mt-2 text-2xl font-semibold text-secondary">
              {latestMeasurement?.waistCm ?? 72} cm
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Profiliniz için kişiselleştirilmiş özetler yakında burada görünecek. Ölçüm ve Treat Wheel verileri otomatik
          olarak senkronize edilecek.
        </p>
      </section>
    </MobileLayout>
  );
}
