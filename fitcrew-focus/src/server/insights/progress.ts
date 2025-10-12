import { startOfISOWeek, endOfISOWeek, subWeeks, startOfMonth, endOfMonth, subMonths, differenceInCalendarDays } from "date-fns";
import type { Measurement, TreatSpin } from "@prisma/client";
import { prisma } from "@/server/db";
import { serializeCoachNote, type SerializedCoachNote } from "@/server/serializers/coach-note";

type BucketUnit = "week" | "month";

type Bucket = {
  unit: BucketUnit;
  start: Date;
  end: Date;
  label: string;
  measurementCount: number;
  weightSum: number;
  waistSum: number;
  hipSum: number;
  weightDatapoints: number;
  waistDatapoints: number;
  hipDatapoints: number;
  treatSpins: number;
  treatBonusMinutes: number;
};

type MeasurementSeriesPoint = {
  period: string;
  startDate: string;
  endDate: string;
  measurementCount: number;
  averageWeightKg: number | null;
  averageWaistCm: number | null;
  averageHipCm: number | null;
  treatSpinCount: number;
  treatBonusMinutes: number;
};

type Summary = {
  latestMeasurementAt: string | null;
  latestWeightKg: number | null;
  previousWeightKg: number | null;
  weightChangeKg: number | null;
  measurementCount: number;
  treatSpinsLast30Days: number;
  treatBonusLast30Days: number;
};

export type ProgressInsights = {
  summary: Summary;
  weeklySeries: MeasurementSeriesPoint[];
  monthlySeries: MeasurementSeriesPoint[];
  recentNotes: SerializedCoachNote[];
};

type Options = {
  userId: string;
  now?: Date;
  notesLimit?: number;
};

function createBuckets(unit: BucketUnit, count: number, now: Date): Bucket[] {
  const buckets: Bucket[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    if (unit === "week") {
      const reference = subWeeks(now, index);
      const start = startOfISOWeek(reference);
      const end = endOfISOWeek(reference);
      buckets.push({
        unit,
        start,
        end,
        label: `${start.getUTCFullYear()}-W${String(getIsoWeekNumber(start)).padStart(2, "0")}`,
        measurementCount: 0,
        weightSum: 0,
        waistSum: 0,
        hipSum: 0,
        weightDatapoints: 0,
        waistDatapoints: 0,
        hipDatapoints: 0,
        treatSpins: 0,
        treatBonusMinutes: 0,
      });
    } else {
      const reference = subMonths(now, index);
      const start = startOfMonth(reference);
      const end = endOfMonth(reference);
      buckets.push({
        unit,
        start,
        end,
        label: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
        measurementCount: 0,
        weightSum: 0,
        waistSum: 0,
        hipSum: 0,
        weightDatapoints: 0,
        waistDatapoints: 0,
        hipDatapoints: 0,
        treatSpins: 0,
        treatBonusMinutes: 0,
      });
    }
  }

  return buckets;
}

function getIsoWeekNumber(date: Date) {
  const temporary = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = temporary.getUTCDay() || 7;
  temporary.setUTCDate(temporary.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(temporary.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((temporary.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNumber;
}

function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function assignMeasurementToBucket(measurement: Measurement, buckets: Bucket[]) {
  for (const bucket of buckets) {
    if (measurement.date >= bucket.start && measurement.date <= bucket.end) {
      bucket.measurementCount += 1;

      const weight = decimalToNumber(measurement.weightKg);
      if (weight !== null) {
        bucket.weightSum += weight;
        bucket.weightDatapoints += 1;
      }

      const waist = decimalToNumber(measurement.waistCm);
      if (waist !== null) {
        bucket.waistSum += waist;
        bucket.waistDatapoints += 1;
      }

      const hip = decimalToNumber(measurement.hipCm);
      if (hip !== null) {
        bucket.hipSum += hip;
        bucket.hipDatapoints += 1;
      }

      break;
    }
  }
}

function assignTreatSpinToBucket(spin: TreatSpin, buckets: Bucket[]) {
  for (const bucket of buckets) {
    if (spin.spunAt >= bucket.start && spin.spunAt <= bucket.end) {
      bucket.treatSpins += 1;
      bucket.treatBonusMinutes += spin.bonusWalkMin;
      break;
    }
  }
}

function formatBuckets(buckets: Bucket[]): MeasurementSeriesPoint[] {
  return buckets.map((bucket) => ({
    period: bucket.label,
    startDate: bucket.start.toISOString(),
    endDate: bucket.end.toISOString(),
    measurementCount: bucket.measurementCount,
    averageWeightKg: bucket.weightDatapoints > 0 ? bucket.weightSum / bucket.weightDatapoints : null,
    averageWaistCm: bucket.waistDatapoints > 0 ? bucket.waistSum / bucket.waistDatapoints : null,
    averageHipCm: bucket.hipDatapoints > 0 ? bucket.hipSum / bucket.hipDatapoints : null,
    treatSpinCount: bucket.treatSpins,
    treatBonusMinutes: bucket.treatBonusMinutes,
  }));
}

function computeSummary(
  measurements: Measurement[],
  treatSpins: TreatSpin[],
  now: Date,
): Summary {
  const sortedMeasurements = [...measurements].sort((a, b) => a.date.getTime() - b.date.getTime());
  const latest = sortedMeasurements.at(-1) ?? null;
  const previous = sortedMeasurements.length > 1 ? sortedMeasurements.at(-2) ?? null : null;

  const latestWeight = latest ? decimalToNumber(latest.weightKg) : null;
  const previousWeight = previous ? decimalToNumber(previous.weightKg) : null;
  let weightChange: number | null = null;
  if (latestWeight !== null && previousWeight !== null) {
    weightChange = parseFloat((latestWeight - previousWeight).toFixed(2));
  }

  let spinsLast30 = 0;
  let bonusLast30 = 0;
  for (const spin of treatSpins) {
    const diff = differenceInCalendarDays(now, spin.spunAt);
    if (diff <= 30) {
      spinsLast30 += 1;
      bonusLast30 += spin.bonusWalkMin;
    }
  }

  return {
    latestMeasurementAt: latest ? latest.date.toISOString() : null,
    latestWeightKg: latestWeight,
    previousWeightKg: previousWeight,
    weightChangeKg: weightChange,
    measurementCount: measurements.length,
    treatSpinsLast30Days: spinsLast30,
    treatBonusLast30Days: bonusLast30,
  };
}

export async function getProgressInsights(options: Options): Promise<ProgressInsights> {
  const now = options.now ?? new Date();
  const weeklyBuckets = createBuckets("week", 8, now);
  const monthlyBuckets = createBuckets("month", 6, now);

  const measurementSince = monthlyBuckets[0]?.start ?? new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [measurements, treatSpins, coachNotes] = await Promise.all([
    prisma.measurement.findMany({
      where: {
        userId: options.userId,
        date: { gte: measurementSince },
      },
      orderBy: { date: "asc" },
    }),
    prisma.treatSpin.findMany({
      where: {
        userId: options.userId,
        spunAt: { gte: measurementSince },
      },
      orderBy: { spunAt: "asc" },
    }),
    prisma.coachNote.findMany({
      where: {
        memberId: options.userId,
        archivedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: options.notesLimit ?? 3,
      include: {
        posts: {
          select: {
            postId: true,
          },
        },
        measurements: {
          select: {
            measurementId: true,
          },
        },
        coach: {
          select: {
            id: true,
            name: true,
            handle: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  for (const measurement of measurements) {
    assignMeasurementToBucket(measurement, weeklyBuckets);
    assignMeasurementToBucket(measurement, monthlyBuckets);
  }

  for (const spin of treatSpins) {
    assignTreatSpinToBucket(spin, weeklyBuckets);
    assignTreatSpinToBucket(spin, monthlyBuckets);
  }

  return {
    summary: computeSummary(measurements, treatSpins, now),
    weeklySeries: formatBuckets(weeklyBuckets),
    monthlySeries: formatBuckets(monthlyBuckets),
    recentNotes: coachNotes.map(serializeCoachNote),
  };
}
