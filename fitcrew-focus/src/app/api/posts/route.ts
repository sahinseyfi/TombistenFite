import { NextRequest } from "next/server";
import { Prisma, PostVisibility } from "@prisma/client";
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
} from "@/server/posts/utils";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_LIMIT = 5;

const measurementSchema = z
  .object({
    waistCm: z.number().min(30).max(200).optional(),
    chestCm: z.number().min(30).max(200).optional(),
    hipCm: z.number().min(30).max(200).optional(),
    armCm: z.number().min(10).max(100).optional(),
    thighCm: z.number().min(20).max(150).optional(),
  })
  .strict();

const createPostSchema = z.object({
  photos: z.array(z.string().url()).max(10, "En fazla 10 fotograf yukleyebilirsiniz").optional(),
  caption: z.string().max(500, "Aciklama 500 karakteri asamaz").optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  weightKg: z.number().min(20).max(400).optional(),
  measurements: measurementSchema.optional(),
  visibility: z.enum(["public", "followers", "private"]).optional(),
  aiCommentRequested: z.boolean().optional(),
});

function clampLimit(value: number) {
  if (Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  const viewerId = session?.sub ?? null;

  const params = request.nextUrl.searchParams;
  const scope = params.get("scope") ?? "public";
  const cursor = params.get("cursor");
  const limitParam = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = clampLimit(Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam);

  let where: Prisma.PostWhereInput;

  switch (scope) {
    case "public":
      where = { visibility: PostVisibility.PUBLIC };
      break;
    case "following":
      if (!viewerId) {
        return jsonError({ code: "unauthorized", message: "Takip akisini gorebilmek icin giris yapmalisiniz." }, 401);
      }
      where = {
        OR: [
          { authorId: viewerId },
          {
            visibility: { not: PostVisibility.PRIVATE },
            author: {
              followers: {
                some: {
                  followerId: viewerId,
                  status: "ACCEPTED",
                },
              },
            },
          },
        ],
      };
      break;
    case "close_friends":
      if (!viewerId) {
        return jsonError({ code: "unauthorized", message: "Yakin arkadas akisini gorebilmek icin giris yapmalisiniz." }, 401);
      }
      where = {
        OR: [
          { authorId: viewerId },
          {
            visibility: { not: PostVisibility.PRIVATE },
            author: {
              followers: {
                some: {
                  followerId: viewerId,
                  status: "ACCEPTED",
                  isCloseFriend: true,
                },
              },
            },
          },
        ],
      };
      break;
    case "me":
      if (!viewerId) {
        return jsonError({ code: "unauthorized", message: "Kendi gonderilerinizi gormek icin giris yapmalisiniz." }, 401);
      }
      where = { authorId: viewerId };
      break;
    default:
      return jsonError({ code: "validation_error", message: "Gecersiz scope parametresi belirtildi." }, 422);
  }

  if (cursor) {
    const cursorExists = await prisma.post.findUnique({
      where: { id: cursor },
      select: { id: true },
    });
    if (!cursorExists) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    take: limit + 1,
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

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const next = posts.pop();
    if (next) {
      nextCursor = next.id;
    }
  }

  const serialized = posts.map((post) =>
    serializePost(post, {
      likedByViewer: viewerId ? Array.isArray((post as any).likes) && (post as any).likes.length > 0 : false,
    }),
  );

  return jsonSuccess({
    posts: serialized,
    nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Gonderi olusturmak icin giris yapmalisiniz." }, 401);
  }

  const viewer = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      handle: true,
      name: true,
      avatarUrl: true,
      defaultVisibility: true,
      aiCommentDefault: true,
    },
  });

  if (!viewer) {
    return jsonError({ code: "unauthorized", message: "Kullanici kaydi bulunamadi." }, 401);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createPostSchema.safeParse(payload);
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

  const input = parsed.data;
  const requestedAiComment = input.aiCommentRequested ?? viewer.aiCommentDefault;
  const visibility = mapVisibility(input.visibility, viewer.defaultVisibility);
  const mealType = mapMealType(input.mealType);
  const measurementData = buildMeasurementData({
    weightKg: input.weightKg,
    measurements: input.measurements,
  });

  const post = await prisma.$transaction(async (tx) => {
    let measurementId: string | undefined;

    if (measurementData) {
      const measurement = await tx.measurement.create({
        data: {
          userId: viewer.id,
          date: new Date(),
          ...measurementData,
        },
      });
      measurementId = measurement.id;
    }

    return tx.post.create({
      data: {
        authorId: viewer.id,
        photos: input.photos ?? [],
        caption: input.caption?.trim() ?? null,
        mealType,
        weightKg: input.weightKg !== undefined ? new Prisma.Decimal(input.weightKg) : undefined,
        visibility,
        aiCommentRequested: requestedAiComment,
        aiCommentStatus: requestedAiComment ? "PENDING" : "IDLE",
        measurementId,
      },
      include: {
        author: { select: authorSelect },
        measurement: { select: measurementSelect },
      },
    });
  });

  return jsonSuccess(
    {
      post: serializePost(post, { likedByViewer: false }),
    },
    201,
  );
}
