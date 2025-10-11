import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { getRedisClient } from "@/server/redis";

const ACTOR_SELECT = {
  id: true,
  handle: true,
  name: true,
  avatarUrl: true,
} as const;

const POST_PREVIEW_SELECT = {
  id: true,
  authorId: true,
  photos: true,
} as const;

const COMMENT_PREVIEW_SELECT = {
  id: true,
  body: true,
} as const;

const UNREAD_CACHE_PREFIX = "fitcrew:notifications:unread";
const UNREAD_CACHE_TTL_SECONDS = 120;

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 50;
const MIN_LIST_LIMIT = 5;

type FanOutEntry = Prisma.NotificationCreateManyInput;

type BaseEvent = {
  occurredAt?: Date;
};

export type PostLikeEvent = BaseEvent & {
  kind: "post_like";
  actorId: string;
  postId: string;
};

export type PostCommentEvent = BaseEvent & {
  kind: "post_comment";
  actorId: string;
  postId: string;
  commentId: string;
  commentBody?: string;
};

export type FollowEvent = BaseEvent & {
  kind: "follow";
  actorId: string;
  targetUserId: string;
};

export type AiCommentReadyEvent = BaseEvent & {
  kind: "ai_comment_ready";
  postId: string;
  summary?: string | null;
};

export type TreatBonusEvent = BaseEvent & {
  kind: "treat_bonus";
  userId: string;
  spinId: string;
  treatName: string;
  bonusWalkMin: number;
  photoUrl?: string | null;
};

export type NotificationEvent =
  | PostLikeEvent
  | PostCommentEvent
  | FollowEvent
  | AiCommentReadyEvent
  | TreatBonusEvent;

function toArray(events: NotificationEvent | NotificationEvent[]) {
  return Array.isArray(events) ? events : [events];
}

function buildUnreadKey(userId: string) {
  return `${UNREAD_CACHE_PREFIX}:${userId}`;
}

function sanitizePreview(text: string | undefined, limit = 140) {
  if (!text) {
    return "";
  }
  const trimmed = text.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, limit - 1)}…`;
}

function toJsonValue<T extends Record<string, unknown>>(value: T): Prisma.JsonObject {
  return JSON.parse(JSON.stringify(value));
}

async function fetchActor(actorId: string) {
  return prisma.user.findUnique({
    where: { id: actorId },
    select: ACTOR_SELECT,
  });
}

async function fetchPost(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    select: POST_PREVIEW_SELECT,
  });
}

async function fetchComment(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    select: COMMENT_PREVIEW_SELECT,
  });
}

async function buildFanOutForEvent(event: NotificationEvent): Promise<FanOutEntry[]> {
  const occurredAt = event.occurredAt ?? new Date();

  switch (event.kind) {
    case "post_like": {
      const [actor, post] = await Promise.all([fetchActor(event.actorId), fetchPost(event.postId)]);

      if (!actor || !post || post.authorId === actor.id) {
        return [];
      }

      return [
        {
          userId: post.authorId,
          type: NotificationType.LIKE,
          payload: toJsonValue({
            actor,
            post: {
              id: post.id,
              previewPhotoUrl: post.photos?.[0] ?? null,
            },
          }),
          createdAt: occurredAt,
        },
      ];
    }

    case "post_comment": {
      const [actor, post, comment] = await Promise.all([
        fetchActor(event.actorId),
        fetchPost(event.postId),
        event.commentBody ? null : fetchComment(event.commentId),
      ]);

      if (!actor || !post || post.authorId === actor.id) {
        return [];
      }

      const body = event.commentBody ?? comment?.body ?? "";

      return [
        {
          userId: post.authorId,
          type: NotificationType.COMMENT,
          payload: toJsonValue({
            actor,
            post: {
              id: post.id,
              previewPhotoUrl: post.photos?.[0] ?? null,
            },
            comment: {
              id: event.commentId,
              preview: sanitizePreview(body),
            },
          }),
          createdAt: occurredAt,
        },
      ];
    }

    case "follow": {
      const actor = await fetchActor(event.actorId);

      if (!actor || actor.id === event.targetUserId) {
        return [];
      }

      return [
        {
          userId: event.targetUserId,
          type: NotificationType.FOLLOW,
          payload: toJsonValue({
            actor,
          }),
          createdAt: occurredAt,
        },
      ];
    }

    case "ai_comment_ready": {
      const post = await fetchPost(event.postId);

      if (!post) {
        return [];
      }

      return [
        {
          userId: post.authorId,
          type: NotificationType.AI_COMMENT_READY,
          payload: toJsonValue({
            post: {
              id: post.id,
              previewPhotoUrl: post.photos?.[0] ?? null,
            },
            summary: event.summary ?? null,
          }),
          createdAt: occurredAt,
        },
      ];
    }

    case "treat_bonus": {
      if (event.bonusWalkMin <= 0) {
        return [];
      }

      return [
        {
          userId: event.userId,
          type: NotificationType.TREAT_BONUS,
          payload: toJsonValue({
            spinId: event.spinId,
            treatName: event.treatName,
            bonusWalkMin: event.bonusWalkMin,
            photoUrl: event.photoUrl ?? null,
          }),
          createdAt: occurredAt,
        },
      ];
    }

    default:
      return [];
  }
}

export async function queueNotificationsForEvent(events: NotificationEvent | NotificationEvent[]) {
  const fanOutEntries = (
    await Promise.all(toArray(events).map((event) => buildFanOutForEvent(event)))
  ).flat();

  if (fanOutEntries.length === 0) {
    return { created: 0 };
  }

  const result = await prisma.notification.createMany({
    data: fanOutEntries.map((entry) => ({
      userId: entry.userId,
      type: entry.type,
      payload: entry.payload,
      createdAt: entry.createdAt,
    })),
  });

  const affectedUsers = new Set(fanOutEntries.map((entry) => entry.userId));
  await Promise.all(Array.from(affectedUsers).map((userId) => invalidateUnreadCount(userId)));

  return { created: result.count };
}

export async function invalidateUnreadCount(userId: string) {
  if (!userId) {
    return;
  }
  const client = getRedisClient();
  if (!client) {
    return;
  }
  try {
    await client.del(buildUnreadKey(userId));
  } catch {
    // Redis hatalar� sessizce yoksay�l�r.
  }
}

export async function cacheUnreadCount(userId: string, count: number) {
  const client = getRedisClient();
  if (!client) {
    return;
  }
  try {
    await client.set(buildUnreadKey(userId), count.toString(), "EX", UNREAD_CACHE_TTL_SECONDS);
  } catch {
    // Redis hatalar� sessizce yoksay�l�r.
  }
}

export async function getUnreadCount(userId: string) {
  if (!userId) {
    return 0;
  }

  const client = getRedisClient();
  if (client) {
    try {
      const cached = await client.get(buildUnreadKey(userId));
      if (cached !== null) {
        const parsed = Number.parseInt(cached, 10);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Redis hatasi g�z ard� edilir.
    }
  }

  const count = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });

  await cacheUnreadCount(userId, count);
  return count;
}

export type ListNotificationsOptions = {
  cursor?: string | null;
  limit?: number;
  unreadOnly?: boolean;
};

function clampLimit(limit: number | undefined) {
  if (limit === undefined || Number.isNaN(limit)) {
    return DEFAULT_LIST_LIMIT;
  }
  return Math.min(Math.max(limit, MIN_LIST_LIMIT), MAX_LIST_LIMIT);
}

export async function listNotifications(
  userId: string,
  options: ListNotificationsOptions = {},
) {
  const limit = clampLimit(options.limit);
  const cursor = options.cursor ?? undefined;

  if (cursor) {
    const exists = await prisma.notification.findUnique({
      where: { id: cursor },
      select: { id: true, userId: true },
    });
    if (!exists || exists.userId !== userId) {
      throw Object.assign(new Error("invalid_cursor"), { code: "invalid_cursor" });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(options.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    take: limit + 1,
  });

  let nextCursor: string | undefined;
  if (notifications.length > limit) {
    const next = notifications.pop();
    if (next) {
      nextCursor = next.id;
    }
  }

  return {
    notifications,
    nextCursor,
  };
}

export async function acknowledgeNotifications(userId: string, notificationIds: string[]) {
  if (!notificationIds.length) {
    return 0;
  }

  const result = await prisma.notification.updateMany({
    where: {
      id: { in: notificationIds },
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  if (result.count > 0) {
    await invalidateUnreadCount(userId);
  }

  return result.count;
}

export async function acknowledgeAllNotifications(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  if (result.count > 0) {
    await invalidateUnreadCount(userId);
  }

  return result.count;
}
