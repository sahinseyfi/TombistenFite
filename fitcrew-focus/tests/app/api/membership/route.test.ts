import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, getMembershipSnapshotMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  getMembershipSnapshotMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/membership/service", () => ({
  getMembershipSnapshot: getMembershipSnapshotMock,
}));

import { GET } from "@/app/api/membership/route";

function buildRequest() {
  return new NextRequest("https://app.local/api/membership");
}

describe("/api/membership", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    getMembershipSnapshotMock.mockReset();
  });

  it("returns 401 when user is not authenticated", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest());
    expect(response.status).toBe(401);
    expect(getMembershipSnapshotMock).not.toHaveBeenCalled();
  });

  it("returns membership snapshot for authenticated user", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    getMembershipSnapshotMock.mockResolvedValueOnce({
      tier: "premium",
      status: "active",
      planHeadline: "FitCrew Premium",
      planPriceHint: "129 \u20BA / ay",
      renewsAt: "2025-11-01T10:00:00.000Z",
      trialEndsAt: null,
      perks: [],
      featureGates: [],
      provider: { provider: "stripe", status: "active" },
      source: "api",
    });

    const response = await GET(buildRequest());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.membership.planHeadline).toBe("FitCrew Premium");
    expect(getMembershipSnapshotMock).toHaveBeenCalledWith("user-1");
  });
});
