import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { ensurePostAccess } from "@/server/posts/utils";

type RouteContext = { params: { id?: string | string[] } };

const reportSchema = z.object({
  reason: z.string().min(3).max(120),
  details: z.string().max(500).optional(),
});

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Gonderi raporlamak icin giris yapmalisiniz." }, 401);
  }

  const rawId = params.id;
  if (typeof rawId !== "string") {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const postId = rawId.trim();
  if (postId.length === 0) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Rapor istegi dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const userId = session.sub.trim();
  if (userId.length === 0) {
    return jsonError({ code: "unauthorized", message: "Giris bilgileri dogrulanamadi." }, 401);
  }

  const access = await ensurePostAccess(postId, userId);
  if (!access.ok) {
    return jsonError({ code: access.code, message: access.message }, access.status);
  }

  const report = await prisma.postReport.create({
    data: {
      postId,
      reporterId: userId,
      reason: parsed.data.reason.trim(),
      details: parsed.data.details?.trim(),
    },
    select: { id: true },
  });

  return jsonSuccess({ reportId: report.id }, 201);
}
