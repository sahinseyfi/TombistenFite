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
    return jsonError({ code: "unauthorized", message: "Takipci listesini gormek icin giris yapmalisiniz." }, 401);
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
          followerId: cursor,
          followeeId: targetUser.id,
        },
      },
      select: { followerId: true },
    });

    if (!cursorFollow) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const followers = await prisma.follow.findMany({
    where: {
      followeeId: targetUser.id,
      status: FollowStatus.ACCEPTED,
    },
    orderBy: [{ createdAt: "desc" }, { followerId: "asc" }],
    cursor: cursor
      ? {
          followerId_followeeId: {
            followerId: cursor,
            followeeId: targetUser.id,
          },
        }
      : undefined,
    skip: cursor ? 1 : 0,
    take: limit + 1,
    include: {
      follower: {
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
  if (followers.length > limit) {
    const next = followers.pop();
    if (next) {
      nextCursor = next.followerId;
    }
  }

  return jsonSuccess(
    {
      users: followers.map((entry) => serializeUser(entry.follower)),
      nextCursor,
    },
    { request },
  );
}
