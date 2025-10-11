import { NextRequest } from "next/server";
import { FollowStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeUser } from "@/server/serializers/user";
import { findUserByIdentifier } from "@/server/users/utils";

type RouteContext = { params: { id?: string | string[] } };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_LIMIT = 5;

function clampLimit(value: number) {
  if (Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
}

function parseTarget(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Takip edilenleri gormek icin giris yapmalisiniz." }, 401);
  }

  const targetIdentifier = parseTarget(params.id);
  if (!targetIdentifier) {
    return jsonError({ code: "validation_error", message: "Gecerli bir kullanici kimligi belirtmelisiniz." }, 400);
  }

  const targetUser = await findUserByIdentifier(targetIdentifier, { id: true });
  if (!targetUser) {
    return jsonError({ code: "not_found", message: "Kullanici bulunamadi." }, 404);
  }

  const searchParams = request.nextUrl.searchParams;
  const cursor = searchParams.get("cursor");
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = clampLimit(Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam);

  if (cursor) {
    const cursorFollow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: targetUser.id,
          followeeId: cursor,
        },
      },
      select: { followeeId: true },
    });

    if (!cursorFollow) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const following = await prisma.follow.findMany({
    where: {
      followerId: targetUser.id,
      status: FollowStatus.ACCEPTED,
    },
    orderBy: [{ createdAt: "desc" }, { followeeId: "asc" }],
    cursor: cursor
      ? {
          followerId_followeeId: {
            followerId: targetUser.id,
            followeeId: cursor,
          },
        }
      : undefined,
    skip: cursor ? 1 : 0,
    take: limit + 1,
    include: {
      followee: {
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      },
    },
  });

  let nextCursor: string | undefined;
  if (following.length > limit) {
    const next = following.pop();
    if (next) {
      nextCursor = next.followeeId;
    }
  }

  return jsonSuccess(
    {
      users: following.map((entry) => serializeUser(entry.followee)),
      nextCursor,
    },
    { request },
  );
}
