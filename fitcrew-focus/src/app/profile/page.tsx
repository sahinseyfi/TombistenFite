import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchProfileOverview, fetchReferrals, fetchUnreadCount } from "@/lib/app-data";

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
  const [unreadCount, referrals, profileResult] = await Promise.all([
    fetchUnreadCount(),
    fetchReferrals(),
    fetchProfileOverview(),
  ]);

  if (profileResult.error === "unauthorized") {
    return (
      <MobileLayout title="Profil" notificationCount={unreadCount}>
        <section className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-6 text-sm text-info-foreground">
          Profil detaylarını görebilmek için lütfen fitcrew hesabınıza giriş yapın.
        </section>
      </MobileLayout>
    );
  }

  const profile = profileResult.profile;
  const profileUser = profile?.user;
  const stats = profileUser?.stats;
  const latestMeasurement = profile?.latestMeasurement ?? null;
  const summary = referrals.summary;
  const analytics = referrals.analytics;
  const conversionPercent = Math.round(((analytics?.conversionRate ?? 0) * 100));
  const pendingPercent = Math.round(((analytics?.pendingRate ?? 0) * 100));
  const shareUrl = referrals.referral?.shareUrl ?? "#";
  const referralCode = referrals.referral?.code ?? "------";
  const disableReferralLink = !referrals.referral;

  return (
    <MobileLayout title="Profil" notificationCount={unreadCount}>
      {profileResult.error === "unavailable" && (
        <div className="rounded-3xl border border-dashed border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground">
          Profil bilgilere şu anda ulaşılamıyor. Mevcut bilgiler gösteriliyor.
        </div>
      )}

      <section className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
            {profileUser?.avatarUrl ? (
              <Image
                src={profileUser.avatarUrl}
                alt={`${profileUser.name} avatarı`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                {profileUser?.name?.at(0) ?? "F"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">{profileUser?.name ?? "FitCrew Üyesi"}</p>
            <p className="text-xs">@{profileUser?.handle ?? "handle"}</p>
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
            <p className="mt-1 text-base font-semibold text-foreground">{stats?.posts ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takipçi</p>
            <p className="mt-1 text-base font-semibold text-foreground">{stats?.followers ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-2">
            <p className="text-muted-foreground">Takip</p>
            <p className="mt-1 text-base font-semibold text-foreground">{stats?.following ?? 0}</p>
          </div>
        </div>
      </section>

      {referrals.error === "unauthorized" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Davet performansınızı görebilmek için lütfen hesabınıza giriş yapın.
        </div>
      )}
      {referrals.error === "unavailable" && (
        <div className="rounded-3xl border border-dashed border-warning/40 bg-warning/10 p-4 text-xs text-warning-foreground">
          Davet verileri yüklenemedi. Aşağıdaki bilgiler güncel olmayabilir.
        </div>
      )}

      <section className="rounded-3xl border border-border bg-card p-6 text-sm">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Davet performansı</h2>
            <p className="text-xs text-muted-foreground">
              Kod: <span className="font-semibold text-foreground">{referralCode}</span>
            </p>
          </div>
          <a
            href={shareUrl}
            target={disableReferralLink ? undefined : "_blank"}
            rel={disableReferralLink ? undefined : "noopener noreferrer"}
            aria-disabled={disableReferralLink}
            className={`rounded-full border border-border px-4 py-2 text-xs font-semibold transition ${
              disableReferralLink
                ? "pointer-events-none text-muted-foreground opacity-60"
                : "text-foreground hover:bg-muted"
            }`}
          >
            Davet bağlantısı
          </a>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-2xl bg-primary/10 px-3 py-3">
            <p className="text-muted-foreground">Toplam</p>
            <p className="mt-1 text-lg font-semibold text-primary">{summary?.total ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-success/10 px-3 py-3">
            <p className="text-muted-foreground">Kabul</p>
            <p className="mt-1 text-lg font-semibold text-success">{summary?.accepted ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-warning/10 px-3 py-3">
            <p className="text-muted-foreground">Beklemede</p>
            <p className="mt-1 text-lg font-semibold text-warning">{summary?.pending ?? 0}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
          <div className="rounded-2xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Dönüş oranı</p>
            <p className="mt-2 text-lg font-semibold text-foreground">%{conversionPercent}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Beklemede: %{pendingPercent} • Waitlist opt-in: {analytics?.waitlistOptIns ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-border px-4 py-3">
            <p className="text-muted-foreground">Bu hafta</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {analytics?.sentThisWeek ?? 0} gönderim / {analytics?.acceptedThisWeek ?? 0} kabul
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Son davet: {formatDateLabel(analytics?.lastInviteSentAt ?? null)}
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
              {latestMeasurement?.weightKg?.toFixed(1) ?? "-"} kg
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/10 px-3 py-4">
            <p className="text-xs text-muted-foreground">Bel çevresi</p>
            <p className="mt-2 text-2xl font-semibold text-secondary">
              {latestMeasurement?.waistCm ?? "-"} cm
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
