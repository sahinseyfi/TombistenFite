import { env } from "@/env";

const DEFAULT_BONUS_VALUES = [0, 15, 20, 30, 60, 90];
const DEFAULT_BONUS_WEIGHTS = [25, 25, 20, 15, 10, 5];

export type BonusDistribution = {
  values: number[];
  weights: number[];
};

export type TreatConfig = {
  cooldownDays: number;
  weeklyLimit: number;
  emaWindowDays: number;
  minWeightLossKg: number;
  minWeightLossPercent: number;
  minMeasurementDays: number;
  bonusDistribution: BonusDistribution;
};

function parseDistribution(raw: string | undefined): number[] | null {
  if (!raw) {
    return null;
  }

  const parts = raw
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (parts.length !== DEFAULT_BONUS_VALUES.length) {
    return null;
  }

  const total = parts.reduce((sum, item) => sum + item, 0);
  return total > 0 ? parts : null;
}

function buildBonusDistribution(): BonusDistribution {
  const parsed = parseDistribution(env.BONUS_WALK_DISTRIBUTION);
  return {
    values: DEFAULT_BONUS_VALUES,
    weights: parsed ?? DEFAULT_BONUS_WEIGHTS,
  };
}

export function getTreatConfig(): TreatConfig {
  return {
    cooldownDays: env.TREAT_SPIN_COOLDOWN_DAYS ?? 4,
    weeklyLimit: env.TREAT_WEEKLY_LIMIT ?? 1,
    emaWindowDays: env.EMA_WINDOW_DAYS ?? 7,
    minWeightLossKg: env.TREAT_MIN_WEIGHT_LOSS_KG ?? 0.8,
    minWeightLossPercent: env.TREAT_MIN_WEIGHT_LOSS_PERCENT ?? 1,
    minMeasurementDays: env.TREAT_MIN_MEASUREMENT_DAYS ?? 4,
    bonusDistribution: buildBonusDistribution(),
  };
}
