import type { AiCommentStatus, MealType, Post, PostVisibility, User } from "@prisma/client";

const visibilityMap: Record<PostVisibility, "public" | "followers" | "private"> = {
  PUBLIC: "public",
  FOLLOWERS: "followers",
  PRIVATE: "private",
};

const mealTypeMap: Record<MealType, "breakfast" | "lunch" | "dinner" | "snack"> = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack",
};

const aiStatusMap: Record<AiCommentStatus, "idle" | "pending" | "ready" | "failed"> = {
  IDLE: "idle",
  PENDING: "pending",
  READY: "ready",
  FAILED: "failed",
};

type AuthorSummary = Pick<User, "id" | "handle" | "name" | "avatarUrl">;

type MeasurementSummary = {
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
};

type PostWithRelations = Post & {
  author: AuthorSummary;
  measurement?: {
    weightKg: unknown;
    waistCm: unknown;
    chestCm: unknown;
    hipCm: unknown;
    armCm: unknown;
    thighCm: unknown;
  } | null;
};

type SerializePostOptions = {
  likedByViewer?: boolean;
};

function decimalToNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : undefined;
}

function buildMeasurements(post: PostWithRelations): MeasurementSummary | undefined {
  const measurement = post.measurement;
  const weight = decimalToNumber(post.weightKg);
  if (!measurement && weight === undefined) {
    return undefined;
  }

  const result: MeasurementSummary = {};

  if (weight !== undefined) {
    result.weightKg = weight;
  }

  if (measurement) {
    const waist = decimalToNumber(measurement.waistCm);
    const chest = decimalToNumber(measurement.chestCm);
    const hip = decimalToNumber(measurement.hipCm);
    const arm = decimalToNumber(measurement.armCm);
    const thigh = decimalToNumber(measurement.thighCm);

    if (waist !== undefined) result.waistCm = waist;
    if (chest !== undefined) result.chestCm = chest;
    if (hip !== undefined) result.hipCm = hip;
    if (arm !== undefined) result.armCm = arm;
    if (thigh !== undefined) result.thighCm = thigh;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function serializePost(post: PostWithRelations, options: SerializePostOptions = {}) {
  const measurements = buildMeasurements(post);

  return {
    id: post.id,
    author: {
      id: post.author.id,
      handle: post.author.handle,
      name: post.author.name,
      avatarUrl: post.author.avatarUrl ?? undefined,
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    photos: post.photos,
    caption: post.caption ?? undefined,
    mealType: post.mealType ? mealTypeMap[post.mealType] : undefined,
    weightKg: decimalToNumber(post.weightKg),
    measurementId: post.measurementId ?? undefined,
    measurements,
    visibility: visibilityMap[post.visibility],
    aiComment: post.aiCommentStatus === "IDLE" && !post.aiCommentRequested
      ? undefined
      : {
          status: aiStatusMap[post.aiCommentStatus],
          summary: post.aiCommentSummary ?? undefined,
          tips: post.aiCommentTips.length > 0 ? post.aiCommentTips : undefined,
        },
    aiCommentRequested: post.aiCommentRequested,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likedByViewer: options.likedByViewer ?? false,
  };
}

export type SerializedPost = ReturnType<typeof serializePost>;
