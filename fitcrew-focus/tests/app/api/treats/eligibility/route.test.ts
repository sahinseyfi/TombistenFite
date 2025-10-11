import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, computeEligibilityMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  computeEligibilityMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/treats/eligibility", () => ({
  computeEligibility: computeEligibilityMock,
}));

import { GET } from "@/app/api/treats/eligibility/route";

function buildRequest(url: string) {
  return new NextRequest(url);
}

describe("/api/treats/eligibility", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    computeEligibilityMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/treats/eligibility"));
    expect(response.status).toBe(401);
    expect(computeEligibilityMock).not.toHaveBeenCalled();
  });

  it("eligibility sonucunu dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    computeEligibilityMock.mockResolvedValueOnce({
      userId: "user-1",
      eligible: true,
      progressDeltaKg: 1.2,
    });

    const response = await GET(buildRequest("https://app.local/api/treats/eligibility"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.eligibility.eligible).toBe(true);
    expect(computeEligibilityMock).toHaveBeenCalledWith("user-1");
  });
});
