import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { generateAuthTokens } from "@/server/auth/jwt";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";
import { normalizeEmail, normalizeHandle, normalizePhone } from "@/server/auth/utils";

const registerSchema = z
  .object({
    email: z.string().email("Geçerli bir e-posta girin").optional(),
    phone: z
      .string()
      .regex(/^[0-9+]{10,16}$/, "Telefon numarası yalnızca rakam ve + içerebilir")
      .optional(),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(72, "Şifre en fazla 72 karakter olmalıdır"),
    name: z.string().min(1).max(120),
    handle: z.string().regex(/^@?[a-z0-9_]{3,32}$/i, "Handle yalnızca harf, rakam ve alt çizgi içerebilir"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email veya telefon alanlarından biri zorunlu",
    path: ["email"],
  });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return jsonError({ code: "invalid_body", message: "Geçersiz JSON gövdesi" }, 400);
  }

  const parsed = registerSchema.safeParse(body);
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
  const handle = normalizeHandle(parsed.data.handle);
  const name = parsed.data.name.trim();
  const passwordHash = await hashPassword(parsed.data.password);

  const conflicts = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        { handle },
      ],
    },
    select: { email: true, phone: true, handle: true },
  });

  if (conflicts) {
    let field = "handle";
    if (email && conflicts.email === email) {
      field = "email";
    } else if (phone && conflicts.phone === phone) {
      field = "phone";
    }

    return jsonError(
      {
        code: "conflict",
        message: `${field} bilgisi kullanımda`,
      },
      409,
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      handle,
      email,
      phone,
      passwordHash,
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

  const tokens = generateAuthTokens({
    sub: user.id,
    handle: user.handle,
    name: user.name,
  });

  return jsonSuccess(
    {
      user: serializeUser(user, { includeSensitive: true }),
      tokens,
    },
    201,
  );
}
