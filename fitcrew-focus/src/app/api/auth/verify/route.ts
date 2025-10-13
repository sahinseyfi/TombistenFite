import { NextRequest } from "next/server";
import { z } from "zod";
import { VerificationTokenType } from "@prisma/client";
import { prisma } from "@/server/db";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getAuthVerificationPerHourLimit,
} from "@/server/rate-limit";
import { verifyHCaptcha } from "@/server/anti-abuse/hcaptcha";
import { consumeVerificationToken } from "@/server/auth/verification";

const verifySchema = z.object({
  token: z.string().trim().min(10).max(128),
  captchaToken: z.string().optional(),
});

function resolveClientIdentifier(request: NextRequest) {
  return (
    request.ip ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Geçersiz istek gövdesi" }, 400);
  }

  const parsed = verifySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Doğrulama isteği doğrulanamadı",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const identifier = resolveClientIdentifier(request);

  const rateLimitResult = await consumeRateLimit({
    identifier: `auth:verify:${identifier}`,
    limit: getAuthVerificationPerHourLimit(),
    windowMs: 60 * 60 * 1000,
  });
  const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult);

  if (rateLimitResult && !rateLimitResult.ok) {
    return jsonError(
      {
        code: "rate_limited",
        message: "Lütfen daha sonra tekrar deneyin.",
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  const captcha = await verifyHCaptcha(parsed.data.captchaToken, {
    remoteIp: identifier,
  });

  if (!captcha.ok) {
    return jsonError(
      {
        code: "captcha_failed",
        message: "hCaptcha doğrulaması başarısız.",
        details: captcha.errorCode ? { code: captcha.errorCode } : undefined,
      },
      {
        status: 403,
        headers: rateLimitHeaders,
      },
    );
  }

  const result = await consumeVerificationToken(parsed.data.token, VerificationTokenType.EMAIL_VERIFICATION);

  if (!result.ok) {
    const reasonMessage =
      result.reason === "expired"
        ? "Doğrulama bağlantısının süresi dolmuş."
        : "Doğrulama bağlantısı geçersiz.";

    return jsonError(
      {
        code: "invalid_token",
        message: reasonMessage,
      },
      {
        status: 400,
        headers: rateLimitHeaders,
      },
    );
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: {
      emailVerifiedAt: new Date(),
    },
  });

  return jsonSuccess(
    {
      verified: true,
    },
    {
      status: 200,
      headers: rateLimitHeaders,
    },
  );
}
