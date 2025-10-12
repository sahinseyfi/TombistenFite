import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma, TreatPortion } from "@prisma/client";
import { getProgressInsights } from "@/server/insights/progress";

const {
  measurementFindManyMock,
  treatSpinFindManyMock,
  coachNoteFindManyMock,
} = vi.hoisted(() => ({
  measurementFindManyMock: vi.fn(),
  treatSpinFindManyMock: vi.fn(),
  coachNoteFindManyMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    measurement: {
      findMany: measurementFindManyMock,
    },
    treatSpin: {
      findMany: treatSpinFindManyMock,
    },
    coachNote: {
      findMany: coachNoteFindManyMock,
    },
  },
}));

const coachNoteStub = {
  id: "note-1",
  coachId: "coach-1",
  memberId: "user-1",
  origin: "MANUAL" as const,
  title: "Haftalik durum",
  body: "Su icmeyi unutma.",
  tags: ["hatirlatma"],
  archivedAt: null,
  createdAt: new Date("2025-10-05T10:00:00.000Z"),
  updatedAt: new Date("2025-10-05T10:00:00.000Z"),
  coach: {
    id: "coach-1",
    name: "Ko\u00E7 Nil",
    handle: "nilcoach",
    avatarUrl: null,
  },
  posts: [{ postId: "post-1" }],
  measurements: [{ measurementId: "measurement-1" }],
};

function makeMeasurement(id: string, date: string, weight: number, waist?: number) {
  return {
    id,
    userId: "user-1",
    date: new Date(date),
    weightKg: new Prisma.Decimal(weight),
    waistCm: waist !== undefined ? new Prisma.Decimal(waist) : null,
    chestCm: null,
    hipCm: null,
    armCm: null,
    thighCm: null,
    createdAt: new Date(date),
  };
}

function makeSpin(id: string, date: string, bonus: number) {
  return {
    id,
    userId: "user-1",
    treatItemId: "treat-1",
    treatNameSnapshot: "Protein Bar",
    photoUrlSnapshot: null,
    kcalHintSnapshot: "210 kcal",
    spunAt: new Date(date),
    portion: TreatPortion.MEDIUM,
    bonusWalkMin: bonus,
    bonusCompleted: false,
    createdAt: new Date(date),
  };
}

describe("getProgressInsights", () => {
  beforeEach(() => {
    measurementFindManyMock.mockReset();
    treatSpinFindManyMock.mockReset();
    coachNoteFindManyMock.mockReset();
  });

  it("haftalik ve aylik serileri tartar ve ozet dondurur", async () => {
    const now = new Date("2025-10-10T10:00:00.000Z");
    measurementFindManyMock.mockResolvedValue([
      makeMeasurement("m-old", "2025-06-15T00:00:00.000Z", 74.2, 82),
      makeMeasurement("m-previous", "2025-09-28T00:00:00.000Z", 72.5, 80),
      makeMeasurement("m-latest", "2025-10-08T00:00:00.000Z", 71.9, 79),
    ]);
    treatSpinFindManyMock.mockResolvedValue([
      makeSpin("s-1", "2025-09-20T00:00:00.000Z", 25),
      makeSpin("s-2", "2025-10-05T00:00:00.000Z", 35),
    ]);
    coachNoteFindManyMock.mockResolvedValue([coachNoteStub]);

    const result = await getProgressInsights({ userId: "user-1", now, notesLimit: 2 });

    expect(measurementFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      }),
    );

    expect(result.summary.latestWeightKg).toBeCloseTo(71.9, 1);
    expect(result.summary.previousWeightKg).toBeCloseTo(72.5, 1);
    expect(result.summary.weightChangeKg).toBeCloseTo(-0.6, 1);
    expect(result.summary.treatSpinsLast30Days).toBe(2);
    expect(result.summary.treatBonusLast30Days).toBe(60);

    expect(result.weeklySeries).toHaveLength(8);
    const latestWeek = result.weeklySeries.at(-1)!;
    expect(latestWeek.averageWeightKg).toBeCloseTo(71.9, 1);
    expect(latestWeek.treatSpinCount).toBe(0);

    expect(result.monthlySeries).toHaveLength(6);
    const octoberSeries = result.monthlySeries.at(-1)!;
    expect(octoberSeries.averageWaistCm).toBeCloseTo(79, 1);

    expect(result.recentNotes).toHaveLength(1);
    expect(result.recentNotes[0].postIds).toContain("post-1");
  });
});
