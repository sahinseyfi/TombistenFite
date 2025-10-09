import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Yetkilendirme gerekli" }, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
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
    return jsonError({ code: "unauthorized", message: "Kullanıcı bulunamadı" }, 401);
  }

  return jsonSuccess({
    user: serializeUser(user, { includeSensitive: true }),
  });
}
