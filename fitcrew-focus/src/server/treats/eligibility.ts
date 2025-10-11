import { subDays } from "date-fns";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { getTreatConfig } from "@/server/treats/config";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type DecimalLike = Prisma.Decimal | string | number | null;

function decimalToNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const asNumber = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(asNumber)) {
    return null;
  }

  return asNumber;
}

export type EligibilityReason =
  | "NEED_MORE_LOSS"
  | "COOLDOWN"
  | "LIMIT_REACHED"
  | "INSUFFICIENT_MEASUREMENTS"
  | "ANOMALY";

export type EligibilityResult = {
  userId: string;
  eligible: boolean;
  reason?: EligibilityReason;
  reasonParams?: {
    kgNeeded?: number;
    days?: number;
    limit?: number;
  };
  etaDays?: number;
  progressDeltaKg?: number;
  lastSpinAt?: string;
};

type MeasurementSummary = {
  date: Date;
  weightKg: DecimalLike;
};

async function loadMeasurements(userId: string, take: number): Promise<MeasurementSummary[]> {
  const records = await prisma.measurement.findMany({
    where: {
      userId,
      weightKg: {
        not: null,
      },
    },
    orderBy: { date: "desc" },
    take,
    select: {
      date: true,
      weightKg: true,
    },
  });

  return records.reverse();
}

function countDistinctMeasurementDays(items: MeasurementSummary[], reference: Date, lookbackDays: number) {
  const cutoff = subDays(reference, lookbackDays);
  const days = new Set<string>();

  items.forEach((item) => {
    if (item.date >= cutoff) {
      days.add(item.date.toISOString().slice(0, 10));
    }
  });

  return days.size;
}

function calculateProgressDelta(
  latest: MeasurementSummary | undefined,
  baseline: MeasurementSummary | undefined,
): number | null {
  if (!latest || !baseline) {
    return null;
  }

  const latestWeight = decimalToNumber(latest.weightKg);
  const baselineWeight = decimalToNumber(baseline.weightKg);

  if (latestWeight === null || baselineWeight === null) {
    return null;
  }

  return baselineWeight - latestWeight;
}

function determineKgNeeded(currentDelta: number, target: number) {
  const remaining = target - currentDelta;
  return remaining > 0 ? Number(remaining.toFixed(2)) : 0;
}

function calculateEtaDays(targetTimestamp: number, now: Date) {
  const diff = targetTimestamp - now.getTime();
  if (diff <= 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

export async function computeEligibility(userId: string, now = new Date()): Promise<EligibilityResult> {
  const config = getTreatConfig();

  const measurementWindow = Math.max(config.emaWindowDays * 4, 28);
  const [lastSpin, weeklySpins, measurements] = await Promise.all([
    prisma.treatSpin.findFirst({
      where: { userId },
      orderBy: { spunAt: "desc" },
      select: { spunAt: true },
    }),
    prisma.treatSpin.findMany({
      where: {
        userId,
        spunAt: { gte: subDays(now, 7) },
      },
      orderBy: { spunAt: "asc" },
      select: { spunAt: true },
    }),
    loadMeasurements(userId, measurementWindow),
  ]);

  const latestMeasurement = measurements.at(-1);

  if (!latestMeasurement) {
    return {
      userId,
      eligible: false,
      reason: "INSUFFICIENT_MEASUREMENTS",
      reasonParams: { days: config.minMeasurementDays },
    };
  }

  const measurementDayCount = countDistinctMeasurementDays(measurements, now, config.emaWindowDays);
  if (measurementDayCount < config.minMeasurementDays) {
    return {
      userId,
      eligible: false,
      reason: "INSUFFICIENT_MEASUREMENTS",
      reasonParams: { days: config.minMeasurementDays },
      lastSpinAt: lastSpin?.spunAt.toISOString(),
    };
  }

  if (config.weeklyLimit > 0 && weeklySpins.length >= config.weeklyLimit) {
    const firstWithinWindow = weeklySpins[0];
    const resetAt = firstWithinWindow
      ? firstWithinWindow.spunAt.getTime() + 7 * MS_PER_DAY
      : now.getTime();

    return {
      userId,
      eligible: false,
      reason: "LIMIT_REACHED",
      reasonParams: { limit: config.weeklyLimit },
      etaDays: calculateEtaDays(resetAt, now),
      lastSpinAt: lastSpin?.spunAt.toISOString(),
    };
  }

  if (lastSpin) {
    const sinceLastSpinMs = now.getTime() - lastSpin.spunAt.getTime();
    const cooldownMs = config.cooldownDays * MS_PER_DAY;
    if (sinceLastSpinMs < cooldownMs) {
      const nextSpinAt = lastSpin.spunAt.getTime() + cooldownMs;
      return {
        userId,
        eligible: false,
        reason: "COOLDOWN",
        reasonParams: { days: calculateEtaDays(nextSpinAt, now) },
        etaDays: calculateEtaDays(nextSpinAt, now),
        lastSpinAt: lastSpin.spunAt.toISOString(),
      };
    }
  }

  let baselineMeasurement: MeasurementSummary | undefined;

  if (lastSpin) {
    const measurementAtSpin = await prisma.measurement.findFirst({
      where: {
        userId,
        date: { lte: lastSpin.spunAt },
        weightKg: { not: null },
      },
      orderBy: { date: "desc" },
      select: { date: true, weightKg: true },
    });
    baselineMeasurement = measurementAtSpin ?? measurements[0];
  } else {
    baselineMeasurement = measurements[0];
  }

  const progressDelta = calculateProgressDelta(latestMeasurement, baselineMeasurement);

  if (progressDelta === null) {
    return {
      userId,
      eligible: false,
      reason: "ANOMALY",
      lastSpinAt: lastSpin?.spunAt.toISOString(),
    };
  }

  const baselineWeight = decimalToNumber(baselineMeasurement?.weightKg ?? null);
  const progressPercent =
    baselineWeight && baselineWeight > 0 ? (progressDelta / baselineWeight) * 100 : Number.NEGATIVE_INFINITY;

  const progressDeltaRounded = Number(progressDelta.toFixed(2));

  if (progressDelta < config.minWeightLossKg && progressPercent < config.minWeightLossPercent) {
    return {
      userId,
      eligible: false,
      reason: "NEED_MORE_LOSS",
      reasonParams: { kgNeeded: determineKgNeeded(progressDelta, config.minWeightLossKg) },
      progressDeltaKg: progressDeltaRounded,
      lastSpinAt: lastSpin?.spunAt.toISOString(),
    };
  }

  return {
    userId,
    eligible: true,
    progressDeltaKg: progressDeltaRounded,
    lastSpinAt: lastSpin?.spunAt.toISOString(),
  };
}
