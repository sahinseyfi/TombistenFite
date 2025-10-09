import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { verifyPassword } from "@/server/auth/password";
import { generateAuthTokens } from "@/server/auth/jwt";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";
import { normalizeEmail, normalizeHandle, normalizePhone } from "@/server/auth/utils";

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^[0-9+]{10,16}$/, "Telefon numarası yalnızca rakam ve + içerebilir")
      .optional(),
    handle: z.string().regex(/^@?[a-z0-9_]{3,32}$/i, "Handle formatı geçersiz").optional(),
    password: z.string().min(8).max(72),
  })
  .refine((data) => data.email || data.phone || data.handle, {
    message: "Email, telefon veya handle alanlarından biri zorunlu",
    path: ["email"],
  });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return jsonError({ code: "invalid_body", message: "Geçersiz JSON gövdesi" }, 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Form alanları doğrulanamadı",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const phone = normalizePhone(parsed.data.phone);
  const handle = parsed.data.handle ? normalizeHandle(parsed.data.handle) : undefined;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(handle ? [{ handle }] : []),
      ],
    },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return jsonError({ code: "invalid_credentials", message: "Kullanıcı bilgileri hatalı" }, 401);
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordMatches) {
    return jsonError({ code: "invalid_credentials", message: "Kullanıcı bilgileri hatalı" }, 401);
  }

  const tokens = generateAuthTokens({
    sub: user.id,
    handle: user.handle,
    name: user.name,
  });

  return jsonSuccess({
    user: serializeUser(user, { includeSensitive: true }),
    tokens,
  });
}
