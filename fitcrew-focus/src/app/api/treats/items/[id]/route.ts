import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeTreatItem } from "@/server/serializers/treat";
import { normalizePortions } from "@/server/treats/utils";

const portionValues = ["small", "medium", "full"] as const;

const updateTreatSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Kacamak adi zorunludur.")
      .max(120, "Kacamak adi en fazla 120 karakter olabilir.")
      .optional(),
    photoUrl: z.union([z.string().url("Foto URL'si gecerli bir adres olmalidir."), z.literal(null)]).optional(),
    kcalHint: z.union([z.string().trim().max(120, "Kalori ipucu en fazla 120 karakter olabilir."), z.literal(null)]).optional(),
    portions: z
      .array(z.enum(portionValues))
      .min(1, "En az bir porsiyon secmelisiniz.")
      .max(3, "En fazla uc porsiyon secilebilir.")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Guncelleme icin en az bir alan gonderilmelidir.",
  });

type RouteParams = {
  params: {
    id: string;
  };
};

async function ensureItemOwnership(userId: string, itemId: string) {
  return prisma.treatItem.findFirst({
    where: { id: itemId, userId },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Kacamak guncellemek icin giris yapmalisiniz." }, 401);
  }

  const itemId = params.id;
  if (!itemId || itemId.trim().length === 0) {
    return jsonError({ code: "validation_error", message: "Gecersiz kacamak kimligi belirtildi." }, 422);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = updateTreatSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Kacamak guncelleme verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const existing = await ensureItemOwnership(session.sub, itemId);
  if (!existing) {
    return jsonError({ code: "not_found", message: "Kacamak kaydi bulunamadi." }, 404);
  }

  const updateData: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name;
  }
  if (parsed.data.photoUrl !== undefined) {
    updateData.photoUrl = parsed.data.photoUrl ?? null;
  }
  if (parsed.data.kcalHint !== undefined) {
    updateData.kcalHint = parsed.data.kcalHint ?? null;
  }
  if (parsed.data.portions !== undefined) {
    updateData.portions = normalizePortions(parsed.data.portions);
  }

  const updated = await prisma.treatItem.update({
    where: { id: existing.id },
    data: updateData,
  });

  return jsonSuccess({ item: serializeTreatItem(updated) });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Kacamak silmek icin giris yapmalisiniz." }, 401);
  }

  const itemId = params.id;
  if (!itemId || itemId.trim().length === 0) {
    return jsonError({ code: "validation_error", message: "Gecersiz kacamak kimligi belirtildi." }, 422);
  }

  const deletion = await prisma.treatItem.deleteMany({
    where: { id: itemId, userId: session.sub },
  });

  if (deletion.count === 0) {
    return jsonError({ code: "not_found", message: "Kacamak kaydi bulunamadi." }, 404);
  }

  return jsonSuccess({ success: true });
}
