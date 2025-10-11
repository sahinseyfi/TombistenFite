import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializePost } from "@/server/serializers/post";
import {
  authorSelect,
  measurementSelect,
  mapVisibility,
  mapMealType,
  buildMeasurementData,
  ensurePostAccess,
} from "@/server/posts/utils";

type RouteContext = { params: { id?: string | string[] } };

const updatePostSchema = z
  .object({
    caption: z.string().max(500, "Aciklama 500 karakteri asamaz").optional(),
    visibility: z.enum(["public", "followers", "private"]).optional(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
    weightKg: z.number().min(20).max(400).optional(),
    measurements: z
      .object({
        waistCm: z.number().min(30).max(200).optional(),
        chestCm: z.number().min(30).max(200).optional(),
        hipCm: z.number().min(30).max(200).optional(),
        armCm: z.number().min(10).max(100).optional(),
        thighCm: z.number().min(20).max(150).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "En az bir alan guncellenmelidir",
  });

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  const viewerId = session?.sub ?? null;

  const rawId = params.id;
  if (typeof rawId !== "string") {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }
  const postId = rawId.trim();
  if (postId.length === 0) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const access = await ensurePostAccess(postId, viewerId);
  if (!access.ok) {
    return jsonError({ code: access.code, message: access.message }, access.status);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: authorSelect },
      measurement: { select: measurementSelect },
      ...(viewerId
        ? {
            likes: {
              where: { userId: viewerId },
              select: { userId: true },
            },
          }
        : {}),
    },
  });

  if (!post) {
    return jsonError({ code: "not_found", message: "Gonderi bulunamadi." }, 404);
  }

  return jsonSuccess({
    post: serializePost(post, {
      likedByViewer: viewerId ? Array.isArray((post as any).likes) && (post as any).likes.length > 0 : false,
    }),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Gonderi duzenlemek icin giris yapmalisiniz." }, 401);
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

  const parsed = updatePostSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Gonderi verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: authorSelect },
      measurement: { select: { ...measurementSelect, id: true } },
    },
  });

  if (!existing) {
    return jsonError({ code: "not_found", message: "Gonderi bulunamadi." }, 404);
  }

  const authorId = session.sub ?? "";
  if (authorId.length === 0) {
    return jsonError({ code: "unauthorized", message: "Giris bilgileri dogrulanamadi." }, 401);
  }

  if (existing.authorId !== authorId) {
    return jsonError({ code: "forbidden", message: "Bu gonderiyi duzenleme yetkiniz yok." }, 403);
  }

  const updates: Prisma.PostUpdateInput = {};
  const input = parsed.data;

  if (input.caption !== undefined) {
    const trimmed = input.caption.trim();
    updates.caption = trimmed.length === 0 ? null : trimmed;
  }

  if (input.visibility) {
    updates.visibility = mapVisibility(input.visibility, existing.visibility);
  }

  if (input.mealType) {
    updates.mealType = mapMealType(input.mealType);
  }

  if (input.weightKg !== undefined) {
    updates.weightKg = new Prisma.Decimal(input.weightKg);
  }

  const measurementData = buildMeasurementData({
    weightKg: input.weightKg,
    measurements: input.measurements,
  });

  const updatedPost = await prisma.$transaction(async (tx) => {
    if (measurementData) {
      if (existing.measurementId) {
        await tx.measurement.update({
          where: { id: existing.measurementId },
          data: {
            ...measurementData,
            date: new Date(),
          },
        });
      } else {
        const measurement = await tx.measurement.create({
          data: {
            userId: existing.authorId,
            date: new Date(),
            ...measurementData,
          },
        });
        updates.measurement = { connect: { id: measurement.id } };
      }
    }

    return tx.post.update({
      where: { id: existing.id },
      data: updates,
      include: {
        author: { select: authorSelect },
        measurement: { select: measurementSelect },
        likes: {
          where: { userId: authorId },
          select: { userId: true },
        },
      },
    });
  });

  return jsonSuccess({
    post: serializePost(updatedPost, {
      likedByViewer: Array.isArray((updatedPost as any).likes) && (updatedPost as any).likes.length > 0,
    }),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Gonderiyi silmek icin giris yapmalisiniz." }, 401);
  }

  const rawId = params.id;
  if (typeof rawId !== "string") {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }
  const postId = rawId.trim();
  if (postId.length === 0) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const authorId = session.sub ?? "";
  if (authorId.length === 0) {
    return jsonError({ code: "unauthorized", message: "Giris bilgileri dogrulanamadi." }, 401);
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, measurementId: true },
  });

  if (!post) {
    return jsonError({ code: "not_found", message: "Gonderi bulunamadi." }, 404);
  }

  if (post.authorId !== authorId) {
    return jsonError({ code: "forbidden", message: "Bu gonderiyi silme yetkiniz yok." }, 403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.post.delete({ where: { id: post.id } });
    if (post.measurementId) {
      await tx.measurement.deleteMany({ where: { id: post.measurementId } });
    }
  });

  return jsonSuccess({ success: true });
}
