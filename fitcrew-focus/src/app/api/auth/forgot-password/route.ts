import { NextRequest } from "next/server";
import { z } from "zod";
import { VerificationTokenType } from "@prisma/client";
import { prisma } from "@/server/db";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getAuthForgotPerHourLimit,
} from "@/server/rate-limit";
import { verifyHCaptcha } from "@/server/anti-abuse/hcaptcha";
import { createVerificationToken } from "@/server/auth/verification";
import { sendPasswordResetEmail } from "@/server/emails/auth";

const forgotSchema = z.object({
  email: z.string().email(),
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

  const parsed = forgotSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "E-posta doğrulanamadı",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const identifier = resolveClientIdentifier(request);
  const rateLimitResult = await consumeRateLimit({
    identifier: `auth:forgot:${identifier}`,
    limit: getAuthForgotPerHourLimit(),
    windowMs: 60 * 60 * 1000,
  });
  const rateHeaders = buildRateLimitHeaders(rateLimitResult);

  if (rateLimitResult && !rateLimitResult.ok) {
    return jsonError(
      {
        code: "rate_limited",
        message: "Çok fazla deneme yaptınız. Lütfen biraz bekleyin.",
      },
      {
        status: 429,
        headers: rateHeaders,
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
        headers: rateHeaders,
      },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user?.email) {
    return jsonSuccess(
      {
        delivered: false,
        status: "noop",
      },
      {
        status: 200,
        headers: rateHeaders,
      },
    );
  }

  try {
    const { token } = await createVerificationToken({
      userId: user.id,
      type: VerificationTokenType.PASSWORD_RESET,
    });

    const result = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token,
      resetToken: token,
    });

    return jsonSuccess(
      {
        delivered: result.delivered,
        status: result.delivered ? "sent" : result.reason ?? "queued",
      },
      {
        status: 200,
        headers: rateHeaders,
      },
    );
  } catch (error) {
    console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
    return jsonError(
      {
        code: "send_failed",
        message: "Şifre sıfırlama e-postası gönderilemedi.",
      },
      {
        status: 500,
        headers: rateHeaders,
      },
    );
  }
}
