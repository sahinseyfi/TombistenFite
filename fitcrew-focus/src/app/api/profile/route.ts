import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serializers/user";
import { serializeMeasurement } from "@/server/serializers/measurement";

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError(
      { code: "unauthorized", message: "Profil bilgilerinizi görüntülemek için giriş yapmalısınız." },
      401,
    );
  }

  const [user, latestMeasurement] = await Promise.all([
    prisma.user.findUnique({
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
    }),
    prisma.measurement.findFirst({
      where: { userId: session.sub },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  if (!user) {
    return jsonError({ code: "not_found", message: "Kullanıcı kaydı bulunamadı." }, 404);
  }

  return jsonSuccess(
    {
      user: serializeUser(user),
      latestMeasurement: latestMeasurement ? serializeMeasurement(latestMeasurement) : null,
    },
    { request },
  );
}
