import { NextRequest } from "next/server";
import { z } from "zod";
import { env } from "@/env";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { processNextAiComment, formatAiJobInfo } from "@/server/ai/comments";

const runSchema = z
  .object({
    count: z.number().min(1).max(10).default(1),
  })
  .default({});

function isAuthorized(request: NextRequest) {
  if (!env.AI_COMMENT_CRON_SECRET) {
    return true;
  }

  const header = request.headers.get("authorization");
  if (!header) {
    return false;
  }

  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return false;
  }

  return token.trim() === env.AI_COMMENT_CRON_SECRET;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError({ code: "unauthorized", message: "Bu uca erişim için geçerli bir yetkilendirme anahtarı gereklidir." }, 401);
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = runSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "AI yorum istek parametreleri doğrulanamadı.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const results = [];
  for (let index = 0; index < parsed.data.count; index += 1) {
    const result = await processNextAiComment();
    results.push(formatAiJobInfo(result));

    if (result.status === "no_job") {
      break;
    }
  }

  return jsonSuccess({
    processed: results.filter((item) => item.status === "success").length,
    results,
  });
}
