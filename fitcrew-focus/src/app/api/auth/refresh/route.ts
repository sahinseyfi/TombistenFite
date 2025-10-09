import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { signAccessToken, verifyRefreshToken } from "@/server/auth/jwt";
import { jsonError, jsonSuccess } from "@/server/api/responses";

const refreshSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token geçersiz"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return jsonError({ code: "invalid_body", message: "Geçersiz JSON gövdesi" }, 400);
  }

  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Refresh token doğrulanamadı",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  try {
    const claims = verifyRefreshToken(parsed.data.refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, handle: true, name: true },
    });

    if (!user) {
      return jsonError({ code: "invalid_token", message: "Refresh token geçersiz" }, 401);
    }

    const access = signAccessToken({
      sub: user.id,
      handle: user.handle,
      name: user.name,
    });

    return jsonSuccess({
      tokenType: "Bearer",
      accessToken: access.token,
      accessTokenExpiresAt: access.expiresAt,
    });
  } catch (error) {
    console.error("Refresh token doğrulaması başarısız:", error);
    return jsonError({ code: "invalid_token", message: "Refresh token geçersiz" }, 401);
  }
}
