import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeTreatSpin } from "@/server/serializers/treat";

const updateSpinSchema = z.object({
  bonusCompleted: z.boolean(),
});

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Bonus durumunu guncellemek icin giris yapmalisiniz." }, 401);
  }

  const spinId = params.id;
  if (!spinId || spinId.trim().length === 0) {
    return jsonError({ code: "validation_error", message: "Gecersiz spin kimligi belirtildi." }, 422);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = updateSpinSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Spin guncelleme verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const existing = await prisma.treatSpin.findFirst({
    where: { id: spinId, userId: session.sub },
  });

  if (!existing) {
    return jsonError({ code: "not_found", message: "Spin kaydi bulunamadi." }, 404);
  }

  const updated = await prisma.treatSpin.update({
    where: { id: existing.id },
    data: { bonusCompleted: parsed.data.bonusCompleted },
  });

  return jsonSuccess({ spin: serializeTreatSpin(updated) });
}
