import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";
import { normalizeHandle } from "@/server/auth/utils";

const searchSchema = z.object({
  q: z.string().trim().min(2, "Arama terimi en az 2 karakter olmalidir."),
  limit: z
    .number()
    .min(5)
    .max(50)
    .default(20),
});

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Arama yapmak icin giris yapmalisiniz." }, 401);
  }

  const params = request.nextUrl.searchParams;
  const data = {
    q: params.get("q") ?? "",
    limit: Number.parseInt(params.get("limit") ?? "", 10),
  };

  const parsed = searchSchema.safeParse({
    q: data.q,
    limit: Number.isNaN(data.limit) ? undefined : data.limit,
  });

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Arama parametreleri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const query = parsed.data.q;
  const handleQuery = normalizeHandle(query).replace(/^@/, "");
  const handleWithPrefix = `@${handleQuery}`;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { handle: { contains: handleQuery, mode: "insensitive" } },
        { handle: { contains: handleWithPrefix, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ name: "asc" }],
    take: parsed.data.limit,
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

  return jsonSuccess(
    {
      users: users.map((user) => serializeUser(user)),
    },
    { request },
  );
}
