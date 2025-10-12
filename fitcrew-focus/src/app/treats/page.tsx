import Image from "next/image";
import MobileLayout from "@/components/layout/MobileLayout";
import PremiumGate from "@/components/premium/PremiumGate";
import { fetchMembership, fetchTreats, fetchUnreadCount } from "@/lib/app-data";

function describeEligibility(eligibility: Awaited<ReturnType<typeof fetchTreats>>["eligibility"]) {
  if (eligibility.eligible) {
    return {
      title: "Spin haz\u0131r",
      message: "Son ilerleme hedefleri kar\u015F\u0131land\u0131. \u00C7ark\u0131 g\u00FCvenle kullanabilirsiniz.",
      tone: "success" as const,
    };
  }

  switch (eligibility.reason) {
    case "COOLDOWN":
      return {
        title: "Bekleme s\u00FCresi",
        message: "Son spin i\u00E7in belirlenen bekleme s\u00FCresi devam ediyor.",
        tone: "warning" as const,
      };
    case "LIMIT_REACHED":
      return {
        title: "Haftal\u0131k limit dolu",
        message: "\u0130\u00E7inde bulundu\u011Funuz hafta i\u00E7in spin limitine ula\u015F\u0131ld\u0131.",
        tone: "warning" as const,
      };
    case "NEED_MORE_LOSS":
      return {
        title: "Biraz daha ilerleme gerekiyor",
        message: "Yeni bir spin a\u00E7mak i\u00E7in hedeflenen kilo kazan\u0131m\u0131na yakla\u015Fmal\u0131s\u0131n\u0131z.",
        tone: "info" as const,
      };
    case "INSUFFICIENT_MEASUREMENTS":
      return {
        title: "\u00D6l\u00E7\u00FCm eksik",
        message: "Son g\u00FCnlerde yeterli \u00F6l\u00E7\u00FCm kayd\u0131 bulunmad\u0131.",
        tone: "info" as const,
      };
    default:
      return {
        title: "Spin kilitli",
        message: "Kriterler kar\u015F\u0131lanmad\u0131. G\u00FCncellemeleri kontrol edin.",
        tone: "muted" as const,
      };
  }
}

function TreatItems({
  items,
}: {
  items: Awaited<ReturnType<typeof fetchTreats>>["items"];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
        Hen\u00FCz kay\u0131tl\u0131 bir ka\u00E7amak bulunmuyor. Favori \u00F6d\u00FCl yiyeceklerinizi ekleyerek spin
        se\u00E7eneklerini zenginle\u015Ftirebilirsiniz.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-sm">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-muted">
            {item.photoUrl && (
              <Image src={item.photoUrl} alt={item.name} fill className="object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.kcalHint ?? "Kalori bilgisi yak\u0131nda eklenecek"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {(item.portions ?? []).map((portion) => (
                <span key={portion} className="rounded-full bg-muted px-3 py-1">
                  {portion === "small" && "Mini"}
                  {portion === "medium" && "Orta"}
                  {portion === "full" && "Tam"}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TreatHistory({
  spins,
}: {
  spins: Awaited<ReturnType<typeof fetchTreats>>["spins"];
}) {
  if (spins.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-sm text-muted-foreground">
        Hen\u00FCz spin ge\u00E7mi\u015Fi olu\u015Fmad\u0131. \u0130lk \u00F6d\u00FCl\u00FCn\u00FCz\u00FC almak i\u00E7in \u00E7ark\u0131 \u00E7evirmeyi deneyin.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {spins.map((spin) => (
        <li
          key={spin.id}
          className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-between text-foreground">
            <span className="font-semibold">{spin.treatNameSnapshot}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(spin.spunAt).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
              {spin.portion === "small" && "Mini"}
              {spin.portion === "medium" && "Orta"}
              {spin.portion === "full" && "Tam"}
            </span>
            <span className="rounded-full bg-secondary/10 px-2 py-1 text-secondary">
              +{spin.bonusWalkMin} dk y\u00FCr\u00FCy\u00FC\u015F
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {spin.bonusCompleted ? "Bonus tamamland\u0131" : "Bonus bekleniyor"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function TreatsPage() {
  const [treatData, unreadCount, membership] = await Promise.all([
    fetchTreats(10),
    fetchUnreadCount(),
    fetchMembership(),
  ]);
  const eligibilitySummary = describeEligibility(treatData.eligibility);

  return (
    <MobileLayout title="\u00C7ark" notificationCount={unreadCount} membership={membership}>
      {treatData.source === "fallback" && (
        <div className="rounded-3xl border border-dashed border-info/40 bg-info/10 p-4 text-xs text-info-foreground">
          Deneme verileri g\u00F6r\u00FCnt\u00FCleniyor. Ger\u00E7ek spin sonu\u00E7lar\u0131 i\u00E7in kimlik do\u011Frulamas\u0131 yap\u0131n.
        </div>
      )}

      <section
        className={
          eligibilitySummary.tone === "success"
            ? "rounded-3xl bg-gradient-to-br from-success/15 via-success/10 to-success/15 p-4 text-sm text-success-foreground"
            : eligibilitySummary.tone === "warning"
              ? "rounded-3xl bg-gradient-to-br from-warning/15 via-warning/10 to-warning/15 p-4 text-sm text-warning-foreground"
              : "rounded-3xl border border-border bg-card p-4 text-sm text-muted-foreground"
        }
      >
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Spin durumu</p>
        <p className="mt-2 text-lg font-semibold text-foreground">{eligibilitySummary.title}</p>
        <p className="mt-2 text-sm">{eligibilitySummary.message}</p>
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Koleksiyon</h2>
          <span className="text-xs text-muted-foreground">
            {treatData.items.length} ka\u00E7amak
          </span>
        </header>
        <TreatItems items={treatData.items} />
      </section>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Son Spinler</h2>
          <span className="text-xs text-muted-foreground">
            {treatData.spins.length} kay\u0131t
          </span>
        </header>
        <PremiumGate featureId="treats_bonus">
          <TreatHistory spins={treatData.spins} />
        </PremiumGate>
      </section>
    </MobileLayout>
  );
}
