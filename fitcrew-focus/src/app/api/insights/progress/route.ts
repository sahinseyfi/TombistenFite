import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { getProgressInsights } from "@/server/insights/progress";

const querySchema = z.object({
  userId: z.string().cuid().optional(),
  range: z.enum(["weekly", "monthly", "all"]).optional(),
  notesLimit: z.coerce.number().min(1).max(10).optional(),
});

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError(
      { code: "unauthorized", message: "Ilerleme analizlerine erisim icin giris yapmalisiniz." },
      401,
    );
  }

  const params = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    userId: params.get("userId") ?? undefined,
    range: params.get("range") ?? undefined,
    notesLimit: params.get("notesLimit") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Ilerleme sorgu parametreleri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const query = parsed.data;
  const viewerId = session.sub;
  const targetUserId = query.userId ?? viewerId;

  if (targetUserId !== viewerId) {
    return jsonError({ code: "forbidden", message: "Baska bir kullanicinin ilerleme verilerine erisim izniniz yok." }, 403);
  }

  const insights = await getProgressInsights({
    userId: targetUserId,
    notesLimit: query.notesLimit,
  });

  const range = query.range ?? "all";

  return jsonSuccess(
    {
      summary: insights.summary,
      weeklySeries: range === "weekly" || range === "all" ? insights.weeklySeries : undefined,
      monthlySeries: range === "monthly" || range === "all" ? insights.monthlySeries : undefined,
      recentNotes: insights.recentNotes,
    },
    { request },
  );
}
