import { TreatPortion } from "@prisma/client";

export const treatPortionMap: Record<TreatPortion, "small" | "medium" | "full"> = {
  SMALL: "small",
  MEDIUM: "medium",
  FULL: "full",
};

const inversePortionMap: Record<string, TreatPortion> = {
  small: TreatPortion.SMALL,
  medium: TreatPortion.MEDIUM,
  full: TreatPortion.FULL,
};

export function mapPortionToClient(portion: TreatPortion) {
  return treatPortionMap[portion];
}

export function mapPortionFromClient(value: string): TreatPortion | null {
  const normalized = value.toLowerCase();
  return inversePortionMap[normalized] ?? null;
}

export function normalizePortions(portions: string[] | undefined): TreatPortion[] {
  if (!portions || portions.length === 0) {
    return [TreatPortion.SMALL, TreatPortion.MEDIUM, TreatPortion.FULL];
  }

  const result: TreatPortion[] = [];
  for (const item of portions) {
    const mapped = mapPortionFromClient(item);
    if (mapped && !result.includes(mapped)) {
      result.push(mapped);
    }
  }

  return result.length > 0 ? result : [TreatPortion.SMALL, TreatPortion.MEDIUM, TreatPortion.FULL];
}
