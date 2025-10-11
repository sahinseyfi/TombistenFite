import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { ensurePostAccess } from "@/server/posts/utils";
import { prisma } from "@/server/db";
import { queueNotificationsForEvent } from "@/server/notifications";

type RouteContext = { params: { id?: string | string[] } };

const likeSchema = z.object({
  like: z.boolean(),
});

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Gonderiyi begenmek icin giris yapmalisiniz." }, 401);
  }

  const rawId = params.id;
  if (typeof rawId !== "string") {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const postId = rawId.trim();
  if (postId.length === 0) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = likeSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Begeni istegi dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const userId = session.sub.trim();
  if (userId.length === 0) {
    return jsonError({ code: "unauthorized", message: "Giris bilgileri dogrulanamadi." }, 401);
  }

  const access = await ensurePostAccess(postId, userId);
  if (!access.ok) {
    return jsonError({ code: access.code, message: access.message }, access.status);
  }

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      select: { postId: true },
    });

    let createdLike = false;

    if (parsed.data.like) {
      if (!existing) {
        await tx.postLike.create({
          data: {
            postId,
            userId,
          },
        });
        await tx.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
        createdLike = true;
      }
    } else if (existing) {
      await tx.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      await tx.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
    }

    const post = await tx.post.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });

    return { post, createdLike };
  });

  if (!result?.post) {
    return jsonError({ code: "not_found", message: "Gonderi bulunamadi." }, 404);
  }

  if (result.createdLike) {
    await queueNotificationsForEvent({
      kind: "post_like",
      actorId: userId,
      postId,
    });
  }

  return jsonSuccess({ likesCount: result.post.likesCount });
}
