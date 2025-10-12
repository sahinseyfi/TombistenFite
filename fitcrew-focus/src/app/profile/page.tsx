import Link from "next/link";
import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import { fetchMembership, fetchUnreadCount } from "@/lib/app-data";
import { FALLBACK_MEASUREMENTS, FALLBACK_POSTS } from "@/lib/fallback-data";

export default async function ProfilePage() {
  const [unreadCount, membership] = await Promise.all([
    fetchUnreadCount(),
    fetchMembership(),
  ]);
  const fallbackUser = FALLBACK_POSTS[0]?.author;
  const latestMeasurement = FALLBACK_MEASUREMENTS[0];
  const isPremium = membership.tier === "premium";
  const statusLabelMap = {
    active: "Aktif",
    trialing: "Deneme",
    past_due: "\u00D6deme bekleniyor",
    canceled: "\u0130ptal edildi",
    inactive: "Pasif",
  } as const;
  const planStatusLabel = statusLabelMap[membership.status] ?? "Pasif";
  const planStatusTone =
    membership.status === "active"
      ? "bg-success/15 text-success"
      : membership.status === "trialing"
        ? "bg-info/15 text-info"
        : membership.status === "past_due"
          ? "bg-warning/15 text-warning"
          : membership.status === "canceled"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground";
  const renewLabel = membership.renewsAt
    ? new Date(membership.renewsAt).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      })
    : null;
  const trialLabel = membership.trialEndsAt
    ? new Date(membership.trialEndsAt).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <MobileLayout title="Profil" notificationCount={unreadCount} membership={membership}>
      <section className="rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan\u0131n\u0131z</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{membership.planHeadline}</p>
            <p className="text-xs text-muted-foreground">{membership.planPriceHint}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${planStatusTone}`}>
            {planStatusLabel}
          </span>
        </div>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          {renewLabel ? (
            <p>
              Bir sonraki yenileme:{" "}
              <span className="font-semibold text-foreground">{renewLabel}</span>
            </p>
          ) : (
            <p>Yenileme tarihi hen\u00FCz tan\u0131mlanmad\u0131.</p>
          )}
          {trialLabel && (
            <p>
              Deneme biti\u015F tarihi:{" "}
              <span className="font-semibold text-foreground">{trialLabel}</span>
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {membership.perks.slice(0, 3).map((perk) => (
            <span
              key={perk.id}
              className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {perk.title}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {!isPremium && (
            <Link
              href={{ pathname: "/premium" }}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Premium\u2019e ge\u00E7
            </Link>
          )}
          <Link
            href={{ pathname: "/premium" }}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Planlar\u0131 incele
          </Link>
          <Link
            href="mailto:support@fitcrew-focus.local"
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
          >
            Destek ile ileti\u015Fim
          </Link>
        </div>
      </section>

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


