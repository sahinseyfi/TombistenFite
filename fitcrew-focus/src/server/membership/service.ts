import {
  BillingProvider as PrismaBillingProvider,
  MembershipPlan as PrismaMembershipPlan,
  MembershipStatus as PrismaMembershipStatus,
} from "@prisma/client";
import { prisma } from "@/server/db";
import { PLAN_CONFIG, resolveFeatureGates } from "@/config/membership";
import type { MembershipSnapshot, MembershipTier, MembershipStatus, MembershipProviderInfo } from "@/types/membership";

function mapTier(plan: PrismaMembershipPlan | null | undefined): MembershipTier {
  if (plan === PrismaMembershipPlan.PREMIUM) {
    return "premium";
  }
  return "free";
}

function mapStatus(status: PrismaMembershipStatus | null | undefined): MembershipStatus {
  switch (status) {
    case PrismaMembershipStatus.ACTIVE:
      return "active";
    case PrismaMembershipStatus.TRIALING:
      return "trialing";
    case PrismaMembershipStatus.PAST_DUE:
      return "past_due";
    case PrismaMembershipStatus.CANCELED:
      return "canceled";
    default:
      return "inactive";
  }
}

function mapProvider(provider: PrismaBillingProvider | null | undefined): MembershipProviderInfo["provider"] {
  switch (provider) {
    case PrismaBillingProvider.STRIPE:
      return "stripe";
    case PrismaBillingProvider.PADDLE:
      return "paddle";
    default:
      return "unknown";
  }
}

export async function getMembershipSnapshot(userId: string): Promise<MembershipSnapshot> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      membershipPlan: true,
      membershipStatus: true,
      membershipRenewsAt: true,
      membershipTrialEndsAt: true,
      billingCustomer: {
        select: {
          provider: true,
          providerCustomerId: true,
          subscriptionId: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Kullanici bulunamadi.");
  }

  const tier = mapTier(user.membershipPlan);
  const status = mapStatus(user.membershipStatus);
  const planConfig = PLAN_CONFIG[tier];

  const provider: MembershipProviderInfo = {
    provider: mapProvider(user.billingCustomer?.provider),
    customerId: user.billingCustomer?.providerCustomerId,
    subscriptionId: user.billingCustomer?.subscriptionId,
    status: mapStatus(user.billingCustomer?.status),
  };

  return {
    tier,
    status,
    planHeadline: planConfig.headline,
    planPriceHint: planConfig.priceHint,
    renewsAt: user.membershipRenewsAt?.toISOString() ?? null,
    trialEndsAt: user.membershipTrialEndsAt?.toISOString() ?? null,
    perks: planConfig.perks,
    featureGates: resolveFeatureGates(tier),
    provider,
    source: "api",
  };
}

