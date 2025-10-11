import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { ensurePostAccess, authorSelect } from "@/server/posts/utils";
import { serializeComment } from "@/server/serializers/comment";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getCommentsPerMinuteLimit,
} from "@/server/rate-limit";
import { prisma } from "@/server/db";
import { queueNotificationsForEvent } from "@/server/notifications";

type RouteContext = { params: { id?: string | string[] } };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_LIMIT = 5;

const createCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Yorum metni bos olamaz.")
    .max(1000, "Yorum 1000 karakteri asamaz."),
});

function clampLimit(value: number) {
  if (Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
}

function parsePostId(rawId: unknown) {
  if (typeof rawId !== "string") {
    return null;
  }
  const trimmed = rawId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  const viewerId = session?.sub ?? null;

  const postId = parsePostId(params.id);
  if (!postId) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const access = await ensurePostAccess(postId, viewerId);
  if (!access.ok) {
    return jsonError({ code: access.code, message: access.message }, access.status);
  }

  const paramsObj = request.nextUrl.searchParams;
  const cursor = paramsObj.get("cursor");
  const limitParam = Number.parseInt(paramsObj.get("limit") ?? "", 10);
  const limit = clampLimit(Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam);

  if (cursor) {
    const cursorExists = await prisma.comment.findUnique({
      where: { id: cursor },
      select: { id: true, postId: true },
    });
    if (!cursorExists || cursorExists.postId !== postId) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    take: limit + 1,
    include: {
      author: { select: authorSelect },
    },
  });

  let nextCursor: string | undefined;
  if (comments.length > limit) {
    const next = comments.pop();
    if (next) {
      nextCursor = next.id;
    }
  }

  return jsonSuccess(
    {
      comments: comments.map((comment) => serializeComment(comment)),
      nextCursor,
    },
    { request },
  );
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Yorum eklemek icin giris yapmalisiniz." }, 401);
  }

  const postId = parsePostId(params.id);
  if (!postId) {
    return jsonError({ code: "validation_error", message: "Gecerli bir gonderi kimligi belirtmelisiniz." }, 400);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createCommentSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Yorum verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const access = await ensurePostAccess(postId, session.sub);
  if (!access.ok) {
    return jsonError({ code: access.code, message: access.message }, access.status);
  }

  const rateLimitResult = await consumeRateLimit({
    identifier: `comments:create:${session.sub}`,
    limit: getCommentsPerMinuteLimit(),
    windowMs: 60_000,
  });
  const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult);

  if (rateLimitResult && !rateLimitResult.ok) {
    return jsonError(
      {
        code: "rate_limited",
        message: `Dakikada en fazla ${rateLimitResult.limit} yorum yapabilirsiniz.`,
        details: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetAt: rateLimitResult.resetAt,
        },
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      },
    );
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        postId,
        authorId: session.sub,
        body: parsed.data.body,
      },
      include: {
        author: { select: authorSelect },
      },
    });

    await tx.post.update({
      where: { id: postId },
      data: {
        commentsCount: { increment: 1 },
      },
    });

    return created;
  });

  await queueNotificationsForEvent({
    kind: "post_comment",
    actorId: session.sub,
    postId,
    commentId: comment.id,
    commentBody: comment.body,
  });

  return jsonSuccess(
    {
      comment: serializeComment(comment),
    },
    {
      status: 201,
      headers: rateLimitHeaders,
    },
  );
}
