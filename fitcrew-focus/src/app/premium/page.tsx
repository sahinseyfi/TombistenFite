import { Check, Crown, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import MobileLayout from "@/components/layout/MobileLayout";
import PremiumGate from "@/components/premium/PremiumGate";
import { PLAN_CONFIG, FEATURE_CATALOG } from "@/config/membership";
import { fetchMembership, fetchUnreadCount } from "@/lib/app-data";

function formatDateLabel(iso: string | null) {
  if (!iso) {
    return null;
  }
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

export default async function PremiumPage() {
  const [membership, unreadCount] = await Promise.all([fetchMembership(), fetchUnreadCount()]);
  const premiumPlan = PLAN_CONFIG.premium;
  const freePlan = PLAN_CONFIG.free;
  const isPremium = membership.tier === "premium";
  const renewLabel = formatDateLabel(membership.renewsAt);
  const trialLabel = formatDateLabel(membership.trialEndsAt);

  return (
    <MobileLayout
      title="Premium"
      notificationCount={unreadCount}
      membership={membership}
      showNotifications={false}
    >
      <section className="space-y-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-6 text-center text-sm text-muted-foreground shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Crown className="h-5 w-5" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-semibold text-foreground">
            FitCrew Premium ile hedefleri hızlandırın
          </h1>
          <p className="text-sm text-muted-foreground">
            Derin analizler, koç destekli rehberlik ve Treat otomasyonu bir arada. Mobil deneyim için optimize edildi.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          {premiumPlan.perks.slice(0, 3).map((perk) => (
            <span
              key={perk.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              {perk.title}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{premiumPlan.headline}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{premiumPlan.priceHint}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Ücretsiz plandan premiuma geçerek aşağıdaki avantajları açın.
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isPremium ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            {isPremium ? "Aktif" : "Kilidi açılmadı"}
          </span>
        </header>

        <ul className="space-y-2 text-sm text-foreground">
          {premiumPlan.perks.map((perk) => (
            <li key={perk.id} className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{perk.title}</p>
                <p className="text-xs text-muted-foreground">{perk.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Mevcut plan durumunuz</p>
          {renewLabel ? (
            <p className="mt-1">
              Bir sonraki yenileme <span className="font-semibold text-foreground">{renewLabel}</span> tarihinde yapılacak.
            </p>
          ) : (
            <p className="mt-1">Yenileme tarihi henüz belirlenmedi.</p>
          )}
          {trialLabel && <p className="mt-1">Deneme süresi {trialLabel} tarihinde sona eriyor.</p>}
          <p className="mt-1">
            Sağlayıcı:{" "}
            <span className="font-semibold text-foreground">
              {membership.provider.provider === "stripe"
                ? "Stripe"
                : membership.provider.provider === "paddle"
                  ? "Paddle"
                  : "Tanımlanmamış"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {!isPremium && (
            <Link
              href="mailto:sales@fitcrew-focus.local?subject=FitCrew%20Premium%20Geçiş"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Premium\u2019e ge\u00E7iş için bağlantı al
            </Link>
          )}
          <Link
            href="mailto:support@fitcrew-focus.local?subject=FitCrew%20Premium%20Destek"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Destek ile iletişime geç
          </Link>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <header>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Karşılaştırma</p>
          <h2 className="text-lg font-semibold text-foreground">Free vs Premium</h2>
        </header>
        <ul className="space-y-2 text-xs">
          {Object.values(FEATURE_CATALOG).map((feature) => {
            const gate = membership.featureGates.find((item) => item.id === feature.id);
            const premiumHas = premiumPlan.featureOverrides?.[feature.id] ?? false;
            const freeHas = freePlan.featureOverrides?.[feature.id] ?? false;
            const isUnlocked = gate?.available ?? false;

            return (
              <li
                key={feature.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 ${freeHas ? "text-success" : "text-muted-foreground"}`}>
                    <Check className="h-3 w-3" aria-hidden />
                    Core
                  </span>
                  <span className={`inline-flex items-center gap-1 ${premiumHas ? "text-primary" : "text-muted-foreground"}`}>
                    {premiumHas ? <Sparkles className="h-3 w-3" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
                    Premium
                  </span>
                  {!isUnlocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">
                      <Lock className="h-3 w-3" aria-hidden />
                      Sende kilitli
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3 rounded-3xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">Sık sorulanlar</h2>
        <div className="space-y-3 text-xs">
          <article>
            <h3 className="font-semibold text-foreground">Premium denemesi var mı?</h3>
            <p>
              Evet, davet kodu üzerinden katılan kullanıcılar 14 günlük deneme süresinden faydalanabilir. Deneme sonunda abonelik otomatik
              yenilenmeden önce e-posta ile bilgilendirme yapıyoruz.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-foreground">Ödemeler nasıl işliyor?</h3>
            <p>
              Stripe veya Paddle üzerinden kredi kartı ile aylık/ yıllık paket satın alabilirsiniz. Planınızı iptal etmek için destek ekibine
              ulaşmanız yeterli.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-foreground">Ekibimiz için toplu lisans alabilir miyiz?</h3>
            <p>
              Evet. Kurumsal paketler için sales@fitcrew-focus.local adresi üzerinden randevu oluşturabilirsiniz.
            </p>
          </article>
        </div>
      </section>

      <PremiumGate featureId="referral_analytics">
        <section className="space-y-3 rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Yakında</p>
              <h2 className="text-base font-semibold text-foreground">Referral analiz panosu</h2>
            </div>
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          </header>
          <p className="text-xs text-muted-foreground">
            Davet gönderiminden aktif aboneliğe kadar tüm funnel adımlarını gerçek zamanlı takip edin. Premium plan ile CRM entegrasyonları da
            aktif hale gelecek.
          </p>
        </section>
      </PremiumGate>
    </MobileLayout>
  );
}
