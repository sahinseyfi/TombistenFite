import type { Measurement } from "@prisma/client";

function decimalToNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : undefined;
}

export function serializeMeasurement(measurement: Measurement) {
  return {
    id: measurement.id,
    userId: measurement.userId,
    date: measurement.date.toISOString(),
    weightKg: decimalToNumber(measurement.weightKg),
    waistCm: decimalToNumber(measurement.waistCm),
    chestCm: decimalToNumber(measurement.chestCm),
    hipCm: decimalToNumber(measurement.hipCm),
    armCm: decimalToNumber(measurement.armCm),
    thighCm: decimalToNumber(measurement.thighCm),
    createdAt: measurement.createdAt.toISOString(),
  };
}
