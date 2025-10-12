import { beforeEach, describe, expect, it, vi } from "vitest";
import { MembershipPlan, MembershipStatus, BillingProvider } from "@prisma/client";
import { getMembershipSnapshot } from "@/server/membership/service";

const { userFindUniqueMock } = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
  },
}));

describe("getMembershipSnapshot", () => {
  beforeEach(() => {
    userFindUniqueMock.mockReset();
  });

  it("maps premium plan details and feature gates", async () => {
    userFindUniqueMock.mockResolvedValueOnce({
      membershipPlan: MembershipPlan.PREMIUM,
      membershipStatus: MembershipStatus.ACTIVE,
      membershipRenewsAt: new Date("2025-11-01T10:00:00.000Z"),
      membershipTrialEndsAt: null,
      billingCustomer: {
        provider: BillingProvider.STRIPE,
        providerCustomerId: "cus_123",
        subscriptionId: "sub_123",
        status: MembershipStatus.ACTIVE,
      },
    });

    const snapshot = await getMembershipSnapshot("user-1");
    expect(snapshot.tier).toBe("premium");
    expect(snapshot.status).toBe("active");
    expect(snapshot.perks).not.toHaveLength(0);
    expect(snapshot.featureGates.every((feature) => feature.available)).toBe(true);
    expect(snapshot.provider.provider).toBe("stripe");
    expect(snapshot.planHeadline).toContain("FitCrew Premium");
  });

  it("throws when user not found", async () => {
    userFindUniqueMock.mockResolvedValueOnce(null);
    await expect(getMembershipSnapshot("missing")).rejects.toThrow("Kullanici bulunamadi.");
  });
});
