import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";
import { normalizeHandle } from "@/server/auth/utils";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = context.params;

  const user = await prisma.user.findFirst({
    where: id.startsWith("@")
      ? { handle: normalizeHandle(id) }
      : { id },
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
    return jsonError({ code: "not_found", message: "Kullanıcı bulunamadı" }, 404);
  }

  return jsonSuccess({
    user: serializeUser(user),
  });
}
