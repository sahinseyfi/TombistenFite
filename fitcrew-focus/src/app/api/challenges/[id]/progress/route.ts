import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { ChallengeServiceError, addChallengeProgress } from "@/server/challenges/service";

const progressSchema = z
  .object({
    quantity: z.number().int().min(1).max(10).default(1),
    taskId: z.string().cuid().optional(),
  })
  .strict();

type RouteParams = {
  id: string;
};

export async function POST(request: NextRequest, context: { params: RouteParams }) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Challenge ilerlemesi g\u00F6ndermek i\u00E7in giri\u015F yapmal\u0131s\u0131n\u0131z." }, 401);
  }

  const { id } = context.params;
  if (!id) {
    return jsonError({ code: "validation_error", message: "Ge\u00E7erli bir challenge kimli\u011Fi belirtmelisiniz." }, 400);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Ge\u00E7ersiz JSON g\u00F6vdesi al\u0131nd\u0131." }, 400);
  }

  const parsed = progressSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      { code: "validation_error", message: "Challenge ilerleme verileri do\u011Frulanamad\u0131.", details: parsed.error.flatten() },
      422,
    );
  }

  try {
    const result = await addChallengeProgress({
      challengeId: id,
      userId: session.sub,
      quantity: parsed.data.quantity,
      taskId: parsed.data.taskId,
    });

    return jsonSuccess(result, 201);
  } catch (error) {
    if (error instanceof ChallengeServiceError) {
      return jsonError({ code: error.code, message: error.message, details: error.details }, error.status);
    }
    console.error("Challenge ilerleme hatas\u0131:", error);
    return jsonError({ code: "internal_error", message: "Challenge ilerlemesi kaydedilirken hata olu\u015Ftu." }, 500);
  }
}
