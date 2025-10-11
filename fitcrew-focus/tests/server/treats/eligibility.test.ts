import { describe, it, expect, beforeEach, vi } from "vitest";
import { computeEligibility } from "@/server/treats/eligibility";

const {
  treatSpinFindFirstMock,
  treatSpinFindManyMock,
  measurementFindManyMock,
  measurementFindFirstMock,
  getTreatConfigMock,
} = vi.hoisted(() => ({
  treatSpinFindFirstMock: vi.fn(),
  treatSpinFindManyMock: vi.fn(),
  measurementFindManyMock: vi.fn(),
  measurementFindFirstMock: vi.fn(),
  getTreatConfigMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    treatSpin: {
      findFirst: treatSpinFindFirstMock,
      findMany: treatSpinFindManyMock,
    },
    measurement: {
      findMany: measurementFindManyMock,
      findFirst: measurementFindFirstMock,
    },
  },
}));

vi.mock("@/server/treats/config", () => ({
  getTreatConfig: getTreatConfigMock,
}));

const defaultConfig = {
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

const baseDate = new Date("2025-10-10T12:00:00.000Z");

function measurement(date: string, weight: string) {
  return {
    date: new Date(date),
    weightKg: weight,
  };
}

describe("computeEligibility", () => {
  beforeEach(() => {
    treatSpinFindFirstMock.mockReset();
    treatSpinFindManyMock.mockReset();
    measurementFindManyMock.mockReset();
    measurementFindFirstMock.mockReset();
    getTreatConfigMock.mockReset();

    getTreatConfigMock.mockReturnValue(defaultConfig);
    treatSpinFindFirstMock.mockResolvedValue(null);
    treatSpinFindManyMock.mockResolvedValue([]);
    measurementFindManyMock.mockResolvedValue([]);
    measurementFindFirstMock.mockResolvedValue(null);
  });

  it("yeterli olcum olmadiginda eligibility reddeder", async () => {
    const result = await computeEligibility("user-1", baseDate);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("INSUFFICIENT_MEASUREMENTS");
  });

  it("haftalik limit asildiginda reddeder", async () => {
    measurementFindManyMock.mockResolvedValue([
      measurement("2025-10-10T08:00:00.000Z", "68.0"),
      measurement("2025-10-09T08:00:00.000Z", "68.2"),
      measurement("2025-10-08T08:00:00.000Z", "68.5"),
      measurement("2025-10-07T08:00:00.000Z", "68.7"),
    ]);
    treatSpinFindManyMock.mockResolvedValue([{ spunAt: new Date("2025-10-08T10:00:00.000Z") }]);

    const result = await computeEligibility("user-1", baseDate);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("LIMIT_REACHED");
    expect(result.reasonParams?.limit).toBe(1);
  });

  it("cooldown surerken reddeder", async () => {
    measurementFindManyMock.mockResolvedValue([
      measurement("2025-10-10T08:00:00.000Z", "68.0"),
      measurement("2025-10-09T08:00:00.000Z", "68.2"),
      measurement("2025-10-08T08:00:00.000Z", "68.5"),
      measurement("2025-10-07T08:00:00.000Z", "68.7"),
    ]);
    treatSpinFindManyMock.mockResolvedValue([]);
    treatSpinFindFirstMock.mockResolvedValue({ spunAt: new Date("2025-10-09T09:00:00.000Z") });

    const result = await computeEligibility("user-1", baseDate);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("COOLDOWN");
    expect(result.reasonParams?.days).toBeGreaterThan(0);
  });

  it("yeterli kilo kaybi varsa eligibility saglar", async () => {
    measurementFindManyMock.mockResolvedValue([
      measurement("2025-10-09T08:00:00.000Z", "67.8"),
      measurement("2025-10-08T08:00:00.000Z", "68.1"),
      measurement("2025-10-06T08:00:00.000Z", "68.9"),
      measurement("2025-10-04T08:00:00.000Z", "69.3"),
    ]);
    treatSpinFindManyMock.mockResolvedValue([]);
    treatSpinFindFirstMock.mockResolvedValue({ spunAt: new Date("2025-10-03T08:00:00.000Z") });
    measurementFindFirstMock.mockResolvedValue(measurement("2025-10-03T08:00:00.000Z", "69.5"));

    const result = await computeEligibility("user-1", baseDate);
    expect(result.eligible).toBe(true);
    expect(result.progressDeltaKg).toBeCloseTo(1.7, 1);
  });
});
