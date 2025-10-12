import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  getProgressInsightsMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  getProgressInsightsMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/insights/progress", () => ({
  getProgressInsights: getProgressInsightsMock,
}));

import { GET } from "@/app/api/insights/progress/route";

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

describe("GET /api/insights/progress", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    getProgressInsightsMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/insights/progress"));
    expect(response.status).toBe(401);
    expect(getProgressInsightsMock).not.toHaveBeenCalled();
  });

  it("farkli kullanici isteginde 403 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });

    const response = await GET(
      buildRequest(
        "https://app.local/api/insights/progress?userId=cluser0000000000000000000002",
      ),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("forbidden");
    expect(getProgressInsightsMock).not.toHaveBeenCalled();
  });

  it("range=weekly ile yalnizca haftalik seriyi dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    getProgressInsightsMock.mockResolvedValueOnce({
      summary: {
        latestMeasurementAt: "2025-10-10T10:00:00.000Z",
        latestWeightKg: 71.4,
        previousWeightKg: 71.9,
        weightChangeKg: -0.5,
        measurementCount: 8,
        treatSpinsLast30Days: 2,
        treatBonusLast30Days: 60,
      },
      weeklySeries: [{ period: "2025-W41", startDate: "", endDate: "", measurementCount: 2, averageWeightKg: 71.4, averageWaistCm: 80, averageHipCm: null, treatSpinCount: 1, treatBonusMinutes: 30 }],
      monthlySeries: [{ period: "2025-10", startDate: "", endDate: "", measurementCount: 2, averageWeightKg: 71.4, averageWaistCm: 80, averageHipCm: null, treatSpinCount: 1, treatBonusMinutes: 30 }],
      recentNotes: [],
    });

    const response = await GET(
      buildRequest("https://app.local/api/insights/progress?range=weekly"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.summary.latestWeightKg).toBe(71.4);
    expect(body.weeklySeries).toHaveLength(1);
    expect(body.monthlySeries).toBeUndefined();
  });
});
