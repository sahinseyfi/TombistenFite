export type MembershipTier = "free" | "premium";
export type MembershipStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled";

export type MembershipPerk = {
  id: string;
  title: string;
  description: string;
};

export type MembershipFeatureGate = {
  id: string;
  title: string;
  description: string;
  available: boolean;
};

export type MembershipProviderInfo = {
  provider: "unknown" | "stripe" | "paddle";
  customerId?: string | null;
  subscriptionId?: string | null;
  status: MembershipStatus;
};

export type MembershipSnapshot = {
  tier: MembershipTier;
  status: MembershipStatus;
  planHeadline: string;
  planPriceHint: string;
  renewsAt: string | null;
  trialEndsAt: string | null;
  perks: MembershipPerk[];
  featureGates: MembershipFeatureGate[];
  provider: MembershipProviderInfo;
  source: "api" | "fallback";
};
