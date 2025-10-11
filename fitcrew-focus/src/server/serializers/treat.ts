import type { TreatItem, TreatPortion, TreatSpin } from "@prisma/client";
import { mapPortionToClient } from "@/server/treats/utils";

type PortionValue = ReturnType<typeof mapPortionToClient>;

function serializePortions(portions: TreatPortion[]): PortionValue[] {
  return portions.map((portion) => mapPortionToClient(portion));
}

export function serializeTreatItem(item: TreatItem) {
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    photoUrl: item.photoUrl ?? undefined,
    kcalHint: item.kcalHint ?? undefined,
    portions: serializePortions(item.portions),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeTreatSpin(spin: TreatSpin) {
  return {
    id: spin.id,
    userId: spin.userId,
    treatItemId: spin.treatItemId ?? undefined,
    treatNameSnapshot: spin.treatNameSnapshot,
    photoUrlSnapshot: spin.photoUrlSnapshot ?? undefined,
    kcalHintSnapshot: spin.kcalHintSnapshot ?? undefined,
    spunAt: spin.spunAt.toISOString(),
    portion: mapPortionToClient(spin.portion),
    bonusWalkMin: spin.bonusWalkMin,
    bonusCompleted: spin.bonusCompleted,
    createdAt: spin.createdAt.toISOString(),
  };
}
