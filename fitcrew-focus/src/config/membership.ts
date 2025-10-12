import type { MembershipPerk, MembershipFeatureGate, MembershipTier } from "@/types/membership";

type PlanConfig = {
  tier: MembershipTier;
  headline: string;
  priceHint: string;
  perks: MembershipPerk[];
  featureOverrides?: Record<string, boolean>;
};

export const FEATURE_CATALOG: Record<string, Omit<MembershipFeatureGate, "available">> = {
  insights_trends: {
    id: "insights_trends",
    title: "Haftal\u0131k & ayl\u0131k trend grafikleri",
    description: "Kilo, bel ve Treat Wheel aktivitesini tek ekranda takip edin.",
  },
  coach_notes: {
    id: "coach_notes",
    title: "Ko\u00E7 ve AI not ar\u015Fivi",
    description: "Ge\u00E7mi\u015F geri bildirimleri filtreleyerek tekrar g\u00F6zden ge\u00E7irin.",
  },
  treats_bonus: {
    id: "treats_bonus",
    title: "Bonus Treat planlay\u0131c\u0131",
    description: "Haftal\u0131k hedeflerinize g\u00F6re otomatik \u00F6neriler al\u0131n.",
  },
  referral_analytics: {
    id: "referral_analytics",
    title: "Referral analiz panosu",
    description: "Davet funnel\u0131n\u0131z\u0131 ve bekleme listesi d\u00F6n\u00FC\u015F\u00FCmlerini izleyin.",
  },
};

export const PLAN_CONFIG: Record<MembershipTier, PlanConfig> = {
  free: {
    tier: "free",
    headline: "FitCrew Core",
    priceHint: "0 \u20BA / ay",
    perks: [
      {
        id: "feed-access",
        title: "Temel ak\u0131\u015F ve topluluk etkile\u015Fimi",
        description: "Post payla\u015F\u0131n, yorum yap\u0131n ve Treat Wheel ile motivasyon toplay\u0131n.",
      },
      {
        id: "measurements",
        title: "Ol\u00E7\u00FCm kayd\u0131 ve takip",
        description: "Kilo, bel ve di\u011Fer metriklerinizi d\u00FCzenli olarak saklay\u0131n.",
      },
    ],
    featureOverrides: {
      insights_trends: false,
      coach_notes: false,
      treats_bonus: false,
      referral_analytics: false,
    },
  },
  premium: {
    tier: "premium",
    headline: "FitCrew Premium",
    priceHint: "129 \u20BA / ay",
    perks: [
      {
        id: "deep-insights",
        title: "Derin trend analizi",
        description: "Haftal\u0131k ve ayl\u0131k \u00F6zetlerle kilit metriklerdeki ilerlemenizi takip edin.",
      },
      {
        id: "coach-support",
        title: "Ko\u00E7 ve AI rehberli\u011Fi",
        description: "AI \u00F6zetleri ve ko\u00E7 notlar\u0131n\u0131 tek zaman \u00E7izelgesinde inceleyin.",
      },
      {
        id: "treat-automation",
        title: "Treat otomasyonu",
        description: "Hedeflerinize g\u00F6re otomatik bonus planlamas\u0131 ve bildirimler.",
      },
      {
        id: "referral-dashboard",
        title: "Referral performans raporlar\u0131",
        description: "Funnel, bekleme listesi ve aktif abonelik d\u00F6n\u00FC\u015Flerinizin \u00F6zetleri.",
      },
    ],
    featureOverrides: {
      insights_trends: true,
      coach_notes: true,
      treats_bonus: true,
      referral_analytics: true,
    },
  },
};

export function resolveFeatureGates(tier: MembershipTier): MembershipFeatureGate[] {
  const plan = PLAN_CONFIG[tier];
  return Object.values(FEATURE_CATALOG).map((feature) => ({
    ...feature,
    available: plan.featureOverrides?.[feature.id] ?? false,
  }));
}
