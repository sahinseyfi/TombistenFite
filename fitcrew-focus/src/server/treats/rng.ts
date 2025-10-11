import { createHash, randomUUID } from "node:crypto";

const HASH_SLICE_LENGTH = 8;
const MAX_UINT_32 = 0xffffffff;

function fractionFromSeed(seed: string, scope: string): number {
  const hash = createHash("sha256").update(`${seed}:${scope}`).digest("hex");
  const slice = hash.slice(0, HASH_SLICE_LENGTH);
  const value = Number.parseInt(slice, 16);
  if (!Number.isFinite(value)) {
    return Math.random();
  }
  return value / MAX_UINT_32;
}

export function buildSeed(clientSeed?: string) {
  return clientSeed && clientSeed.trim().length > 0 ? clientSeed.trim() : randomUUID();
}

export function pickIndex(length: number, seed: string, scope: string) {
  if (length <= 0) {
    throw new Error("Secilecek ogeler bulunamadi.");
  }
  const fraction = fractionFromSeed(seed, scope);
  return Math.min(length - 1, Math.floor(fraction * length));
}

export function pickWeighted(values: number[], weights: number[], seed: string, scope: string) {
  if (values.length !== weights.length || values.length === 0) {
    throw new Error("Gecersiz agirlik dagilimi.");
  }

  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    throw new Error("Agirlik dagilimi toplami sifirdan buyuk olmalidir.");
  }

  const fraction = fractionFromSeed(seed, scope);
  const target = fraction * total;

  let cumulative = 0;
  for (let index = 0; index < values.length; index += 1) {
    cumulative += weights[index];
    if (target <= cumulative) {
      return values[index];
    }
  }

  return values[values.length - 1];
}
