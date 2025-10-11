import { NotificationType, type Notification } from "@prisma/client";

type ActorSnapshot = {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
};

type PostSnapshot = {
  id: string;
  previewPhotoUrl?: string | null;
};

type CommentSnapshot = {
  id: string;
  preview?: string | null;
};

type TreatBonusSnapshot = {
  spinId: string;
  treatName: string;
  bonusWalkMin: number;
  photoUrl?: string | null;
};

type NotificationPayload = {
  actor?: unknown;
  post?: unknown;
  comment?: unknown;
  summary?: unknown;
  spinId?: unknown;
  treatName?: unknown;
  bonusWalkMin?: unknown;
  photoUrl?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toActorSnapshot(value: unknown): ActorSnapshot | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const id = typeof record.id === "string" ? record.id : null;
  const handle = typeof record.handle === "string" ? record.handle : null;
  const name = typeof record.name === "string" ? record.name : null;
  const avatarUrl =
    typeof record.avatarUrl === "string" || record.avatarUrl === null ? (record.avatarUrl ?? null) : null;

  if (!id || !handle || !name) {
    return undefined;
  }

  return {
    id,
    handle,
    name,
    avatarUrl,
  };
}

function toPostSnapshot(value: unknown): PostSnapshot | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const id = typeof record.id === "string" ? record.id : null;
  if (!id) {
    return undefined;
  }

  const previewPhotoUrl =
    typeof record.previewPhotoUrl === "string" || record.previewPhotoUrl === null
      ? (record.previewPhotoUrl ?? null)
      : undefined;

  return {
    id,
    previewPhotoUrl,
  };
}

function toCommentSnapshot(value: unknown): CommentSnapshot | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const id = typeof record.id === "string" ? record.id : null;
  if (!id) {
    return undefined;
  }

  const preview =
    typeof record.preview === "string" || record.preview === null ? (record.preview ?? null) : undefined;

  return {
    id,
    preview,
  };
}

function toTreatBonusSnapshot(payload: NotificationPayload): TreatBonusSnapshot | undefined {
  const spinId = typeof payload.spinId === "string" ? payload.spinId : null;
  const treatName = typeof payload.treatName === "string" ? payload.treatName : null;
  const bonusWalkMin =
    typeof payload.bonusWalkMin === "number" ? payload.bonusWalkMin : Number(payload.bonusWalkMin ?? NaN);
  const photoUrl =
    typeof payload.photoUrl === "string" || payload.photoUrl === null ? (payload.photoUrl ?? null) : undefined;

  if (!spinId || !treatName || Number.isNaN(bonusWalkMin)) {
    return undefined;
  }

  return {
    spinId,
    treatName,
    bonusWalkMin,
    photoUrl,
  };
}

function parsePayload(payload: unknown): NotificationPayload {
  const record = asRecord(payload);
  if (!record) {
    return {};
  }
  return record as NotificationPayload;
}

export type SerializedNotification = {
  id: string;
  type: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  actor?: ActorSnapshot;
  post?: PostSnapshot;
  comment?: CommentSnapshot;
  aiComment?: {
    summary: string | null;
  };
  treatBonus?: TreatBonusSnapshot;
};

export function serializeNotification(notification: Notification): SerializedNotification {
  const payload = parsePayload(notification.payload);
  const actor = toActorSnapshot(payload.actor);
  const post = toPostSnapshot(payload.post);
  const comment = toCommentSnapshot(payload.comment);
  const summary = typeof payload.summary === "string" ? payload.summary : null;
  const treatBonus = toTreatBonusSnapshot(payload);

  const aiComment = notification.type === NotificationType.AI_COMMENT_READY ? { summary } : undefined;

  return {
    id: notification.id,
    type: notification.type.toLowerCase(),
    read: notification.readAt !== null,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
    actor,
    post,
    comment,
    aiComment,
    treatBonus,
  };
}
