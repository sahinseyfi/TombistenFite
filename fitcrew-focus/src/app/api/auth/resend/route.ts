import { NextRequest } from "next/server";
import { z } from "zod";
import { VerificationTokenType } from "@prisma/client";
import { prisma } from "@/server/db";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getAuthResendPerHourLimit,
} from "@/server/rate-limit";
import { verifyHCaptcha } from "@/server/anti-abuse/hcaptcha";
import { createVerificationToken } from "@/server/auth/verification";
import { sendVerificationEmail } from "@/server/emails/auth";

const resendSchema = z.object({
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

  const parsed = resendSchema.safeParse(payload);
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
    identifier: `auth:resend:${identifier}`,
    limit: getAuthResendPerHourLimit(),
    windowMs: 60 * 60 * 1000,
  });
  const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult);

  if (rateLimitResult && !rateLimitResult.ok) {
    return jsonError(
      {
        code: "rate_limited",
        message: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.",
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

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || !user.email) {
    return jsonSuccess(
      {
        delivered: false,
        status: "noop",
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      },
    );
  }

  if (user.emailVerifiedAt) {
    return jsonSuccess(
      {
        delivered: false,
        status: "already_verified",
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      },
    );
  }

  try {
    const { token } = await createVerificationToken({
      userId: user.id,
      type: VerificationTokenType.EMAIL_VERIFICATION,
    });

    const result = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return jsonSuccess(
      {
        delivered: result.delivered,
        status: result.delivered ? "sent" : result.reason ?? "queued",
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    console.error("Doğrulama e-postası gönderilemedi:", error);
    return jsonError(
      {
        code: "send_failed",
        message: "Doğrulama e-postası gönderilemedi.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      },
    );
  }
}
