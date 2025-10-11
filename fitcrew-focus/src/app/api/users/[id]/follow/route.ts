import { NextRequest } from "next/server";
import { FollowStatus } from "@prisma/client";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { findUserByIdentifier } from "@/server/users/utils";
import { prisma } from "@/server/db";
import { queueNotificationsForEvent } from "@/server/notifications";

type RouteContext = { params: { id?: string | string[] } };

function parseTarget(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function resolveUserId(identifier: string) {
  const user = await findUserByIdentifier(identifier, { id: true });

  return user?.id ?? null;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Takip islemi icin giris yapmalisiniz." }, 401);
  }

  const targetIdentifier = parseTarget(params.id);
  if (!targetIdentifier) {
    return jsonError({ code: "validation_error", message: "Gecerli bir kullanici kimligi belirtmelisiniz." }, 400);
  }

  const targetUserId = await resolveUserId(targetIdentifier);
  if (!targetUserId) {
    return jsonError({ code: "not_found", message: "Kullanici bulunamadi." }, 404);
  }

  if (targetUserId === session.sub) {
    return jsonError({ code: "validation_error", message: "Kendinizi takip edemezsiniz." }, 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: session.sub,
          followeeId: targetUserId,
        },
      },
      select: { status: true },
    });

    const follow = await tx.follow.upsert({
      where: {
        followerId_followeeId: {
          followerId: session.sub,
          followeeId: targetUserId,
        },
      },
      update: {
        status: FollowStatus.ACCEPTED,
        isCloseFriend: false,
      },
      create: {
        followerId: session.sub,
        followeeId: targetUserId,
        status: FollowStatus.ACCEPTED,
      },
      select: { status: true },
    });

    return { follow, previousStatus: existing?.status ?? null };
  });

  if (result.previousStatus !== FollowStatus.ACCEPTED && result.follow.status === FollowStatus.ACCEPTED) {
    await queueNotificationsForEvent({
      kind: "follow",
      actorId: session.sub,
      targetUserId,
    });
  }

  return jsonSuccess({
    status: result.follow.status.toLowerCase(),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Takibi iptal etmek icin giris yapmalisiniz." }, 401);
  }

  const targetIdentifier = parseTarget(params.id);
  if (!targetIdentifier) {
    return jsonError({ code: "validation_error", message: "Gecerli bir kullanici kimligi belirtmelisiniz." }, 400);
  }

  const targetUserId = await resolveUserId(targetIdentifier);
  if (!targetUserId) {
    return jsonError({ code: "not_found", message: "Kullanici bulunamadi." }, 404);
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: session.sub,
      followeeId: targetUserId,
    },
  });

  return jsonSuccess({ success: true });
}
