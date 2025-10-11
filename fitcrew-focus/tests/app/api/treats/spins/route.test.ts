import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { TreatPortion } from "@prisma/client";

const {
  authenticateMock,
  treatSpinFindManyMock,
  treatSpinFindFirstMock,
  treatSpinCreateMock,
  treatItemFindManyMock,
  computeEligibilityMock,
  getTreatConfigMock,
  buildSeedMock,
  pickIndexMock,
  pickWeightedMock,
  consumeRateLimitMock,
  buildRateLimitHeadersMock,
  getSpinsLimitMock,
  queueNotificationsMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  treatSpinFindManyMock: vi.fn(),
  treatSpinFindFirstMock: vi.fn(),
  treatSpinCreateMock: vi.fn(),
  treatItemFindManyMock: vi.fn(),
  computeEligibilityMock: vi.fn(),
  getTreatConfigMock: vi.fn(),
  buildSeedMock: vi.fn(),
  pickIndexMock: vi.fn(),
  pickWeightedMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  buildRateLimitHeadersMock: vi.fn(),
  getSpinsLimitMock: vi.fn().mockReturnValue(3),
  queueNotificationsMock: vi.fn().mockResolvedValue({ created: 1 }),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    treatSpin: {
      findMany: treatSpinFindManyMock,
      findFirst: treatSpinFindFirstMock,
      create: treatSpinCreateMock,
    },
    treatItem: {
      findMany: treatItemFindManyMock,
    },
  },
}));

vi.mock("@/server/treats/eligibility", () => ({
  computeEligibility: computeEligibilityMock,
}));

vi.mock("@/server/treats/config", () => ({
  getTreatConfig: getTreatConfigMock,
}));

vi.mock("@/server/treats/rng", () => ({
  buildSeed: buildSeedMock,
  pickIndex: pickIndexMock,
  pickWeighted: pickWeightedMock,
}));

vi.mock("@/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  buildRateLimitHeaders: buildRateLimitHeadersMock,
  getSpinsPerDayLimit: getSpinsLimitMock,
}));

vi.mock("@/server/notifications", () => ({
  queueNotificationsForEvent: queueNotificationsMock,
}));

import { GET, POST } from "@/app/api/treats/spins/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const baseSpin = {
  id: "spin-1",
  userId: "user-1",
  treatItemId: "treat-1",
  treatNameSnapshot: "Baklava",
  photoUrlSnapshot: "https://cdn.local/treats/baklava.jpg",
  kcalHintSnapshot: "400 kcal",
  spunAt: new Date("2025-10-10T12:00:00.000Z"),
  portion: TreatPortion.MEDIUM,
  bonusWalkMin: 30,
  bonusCompleted: false,
  createdAt: new Date("2025-10-10T12:00:00.000Z"),
};

const configStub = {
  cooldownDays: 4,
  weeklyLimit: 1,
  emaWindowDays: 7,
  minWeightLossKg: 0.8,
  minWeightLossPercent: 1,
  minMeasurementDays: 4,
  bonusDistribution: {
    values: [0, 15, 20, 30, 60, 90],
    weights: [25, 25, 20, 15, 10, 5],
  },
};

describe("/api/treats/spins", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    treatSpinFindManyMock.mockReset();
    treatSpinFindFirstMock.mockReset();
    treatSpinCreateMock.mockReset();
    treatItemFindManyMock.mockReset();
    computeEligibilityMock.mockReset();
    getTreatConfigMock.mockReset();
    buildSeedMock.mockReset();
    pickIndexMock.mockReset();
    pickWeightedMock.mockReset();
    consumeRateLimitMock.mockReset();
    buildRateLimitHeadersMock.mockReset();
    getSpinsLimitMock.mockReset();
    queueNotificationsMock.mockReset();

    getTreatConfigMock.mockReturnValue(configStub);
    buildSeedMock.mockReturnValue("seed");
    pickIndexMock.mockImplementation((length: number) => Math.min(length - 1, 0));
    pickWeightedMock.mockReturnValue(30);
    getSpinsLimitMock.mockReturnValue(3);
    consumeRateLimitMock.mockResolvedValue(null);
    buildRateLimitHeadersMock.mockImplementation(() => undefined);
  });

  it("oturum yoksa GET 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/treats/spins"));
    expect(response.status).toBe(401);
    expect(treatSpinFindManyMock).not.toHaveBeenCalled();
  });

  it("gecersiz cursor icin 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatSpinFindFirstMock.mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest("https://app.local/api/treats/spins?cursor=clspin0000000000000000000001"),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
  });

  it("If-None-Match eslesirse GET 304 dondurur", async () => {
    authenticateMock.mockReturnValue({ sub: "user-1" });
    const spins = [
      {
        ...baseSpin,
        id: "spin-1",
      },
      {
        ...baseSpin,
        id: "spin-2",
      },
    ];
    treatSpinFindManyMock.mockResolvedValueOnce([...spins]);

    const firstResponse = await GET(buildRequest("https://app.local/api/treats/spins"));
    expect(firstResponse.status).toBe(200);
    const etag = firstResponse.headers.get("etag");
    expect(etag).toBeTruthy();

    treatSpinFindManyMock.mockResolvedValueOnce([...spins]);
    const secondResponse = await GET(
      buildRequest("https://app.local/api/treats/spins", {
        headers: {
          "if-none-match": etag!,
        },
      }),
    );

    expect(secondResponse.status).toBe(304);
    expect(secondResponse.headers.get("etag")).toBe(etag);
  });

  it("eligibility reddedilirse 403 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemFindManyMock.mockResolvedValueOnce([
      {
        id: "treat-1",
        userId: "user-1",
        name: "Baklava",
        photoUrl: null,
        kcalHint: null,
        portions: [TreatPortion.SMALL],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    computeEligibilityMock.mockResolvedValueOnce({
      userId: "user-1",
      eligible: false,
      reason: "COOLDOWN",
      reasonParams: { days: 2 },
    });

    const response = await POST(
      buildRequest("https://app.local/api/treats/spins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientSeed: "abc" }),
      }),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("eligibility_failed");
  });

  it("basarili spin olusturur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    treatItemFindManyMock.mockResolvedValueOnce([
      {
        id: "treat-1",
        userId: "user-1",
        name: "Baklava",
        photoUrl: null,
        kcalHint: null,
        portions: [TreatPortion.MEDIUM],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    computeEligibilityMock.mockResolvedValueOnce({
      userId: "user-1",
      eligible: true,
      progressDeltaKg: 1.2,
    });
    const limitResult = {
      ok: true,
      limit: 3,
      remaining: 2,
      resetAt: 1700000000 * 1000,
      hitCount: 1,
    };
    consumeRateLimitMock.mockResolvedValueOnce(limitResult);
    buildRateLimitHeadersMock.mockReturnValueOnce({
      "X-RateLimit-Limit": "3",
      "X-RateLimit-Remaining": "2",
      "X-RateLimit-Reset": "1700000000",
    });
    treatSpinCreateMock.mockResolvedValueOnce(baseSpin);

    const response = await POST(
      buildRequest("https://app.local/api/treats/spins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientSeed: "abc" }),
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-ratelimit-limit")).toBe("3");
    const body = await response.json();
    expect(body.spin.treatNameSnapshot).toBe("Baklava");
    expect(body.spin.bonusWalkMin).toBe(30);

    expect(treatSpinCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        treatItemId: "treat-1",
      }),
    });
    expect(buildRateLimitHeadersMock).toHaveBeenCalledWith(limitResult);
    expect(queueNotificationsMock).toHaveBeenCalledWith({
      kind: "treat_bonus",
      userId: "user-1",
      spinId: "spin-1",
      treatName: "Baklava",
      bonusWalkMin: 30,
      photoUrl: "https://cdn.local/treats/baklava.jpg",
    });
  });

  it("rate limit asildiginda 429 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });

    const limitResult = {
      ok: false,
      limit: 3,
      remaining: 0,
      resetAt: 1700003600 * 1000,
      hitCount: 4,
    };
    consumeRateLimitMock.mockResolvedValueOnce(limitResult);
    buildRateLimitHeadersMock.mockReturnValueOnce({
      "X-RateLimit-Limit": "3",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": "1700003600",
      "Retry-After": "3600",
    });

    const response = await POST(
      buildRequest("https://app.local/api/treats/spins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientSeed: "xyz" }),
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("x-ratelimit-limit")).toBe("3");
    expect(buildRateLimitHeadersMock).toHaveBeenCalledWith(limitResult);
    const body = await response.json();
    expect(body.error.code).toBe("rate_limited");
    expect(treatItemFindManyMock).not.toHaveBeenCalled();
    expect(treatSpinCreateMock).not.toHaveBeenCalled();
  });
});
