import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeTreatItem } from "@/server/serializers/treat";
import { normalizePortions } from "@/server/treats/utils";

const portionValues = ["small", "medium", "full"] as const;

const createTreatSchema = z.object({
  name: z.string().trim().min(1, "Kacamak adi zorunludur.").max(120, "Kacamak adi en fazla 120 karakter olabilir."),
  photoUrl: z.string().url("Foto URL'si gecerli bir adres olmalidir.").optional(),
  kcalHint: z.string().trim().max(120, "Kalori ipucu en fazla 120 karakter olabilir.").optional(),
  portions: z
    .array(z.enum(portionValues))
    .min(1, "En az bir porsiyon secmelisiniz.")
    .max(3, "En fazla uc porsiyon secilebilir.")
    .optional(),
});

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Kacamak listenizi gormek icin giris yapmalisiniz." }, 401);
  }

  const items = await prisma.treatItem.findMany({
    where: { userId: session.sub },
    orderBy: [{ createdAt: "desc" }],
  });

  return jsonSuccess(
    {
      items: items.map(serializeTreatItem),
    },
    { request },
  );
}

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Kacamak eklemek icin giris yapmalisiniz." }, 401);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createTreatSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Kacamak verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const portions = normalizePortions(parsed.data.portions);

  const created = await prisma.treatItem.create({
    data: {
      userId: session.sub,
      name: parsed.data.name,
      photoUrl: parsed.data.photoUrl ?? null,
      kcalHint: parsed.data.kcalHint ?? null,
      portions,
    },
  });

  return jsonSuccess({ item: serializeTreatItem(created) }, 201);
}
