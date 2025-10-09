import { Prisma, PostVisibility, MealType } from "@prisma/client";
import { prisma } from "@/server/db";

export const authorSelect = {
  id: true,
  handle: true,
  name: true,
  avatarUrl: true,
} as const;

export const measurementSelect = {
  weightKg: true,
  waistCm: true,
  chestCm: true,
  hipCm: true,
  armCm: true,
  thighCm: true,
} as const;

export type MeasurementInput = {
  weightKg?: number;
  measurements?: {
    waistCm?: number;
    chestCm?: number;
    hipCm?: number;
    armCm?: number;
    thighCm?: number;
  };
};

export function mapVisibility(value: string | undefined, fallback: PostVisibility): PostVisibility {
  switch (value) {
    case "public":
      return PostVisibility.PUBLIC;
    case "followers":
      return PostVisibility.FOLLOWERS;
    case "private":
      return PostVisibility.PRIVATE;
    default:
      return fallback;
  }
}

export function mapMealType(value: string | undefined): MealType | undefined {
  if (!value) return undefined;
  switch (value) {
    case "breakfast":
      return MealType.BREAKFAST;
    case "lunch":
      return MealType.LUNCH;
    case "dinner":
      return MealType.DINNER;
    case "snack":
      return MealType.SNACK;
    default:
      return undefined;
  }
}

export function buildMeasurementData(input: MeasurementInput) {
  const measurement = input.measurements;
  const weight = input.weightKg;
  const hasMeasurement =
    weight !== undefined ||
    Boolean(measurement && Object.values(measurement).some((value) => value !== undefined));

  if (!hasMeasurement) {
    return null;
  }

  return {
    weightKg: weight !== undefined ? new Prisma.Decimal(weight) : undefined,
    waistCm: measurement?.waistCm !== undefined ? new Prisma.Decimal(measurement.waistCm) : undefined,
    chestCm: measurement?.chestCm !== undefined ? new Prisma.Decimal(measurement.chestCm) : undefined,
    hipCm: measurement?.hipCm !== undefined ? new Prisma.Decimal(measurement.hipCm) : undefined,
    armCm: measurement?.armCm !== undefined ? new Prisma.Decimal(measurement.armCm) : undefined,
    thighCm: measurement?.thighCm !== undefined ? new Prisma.Decimal(measurement.thighCm) : undefined,
  };
}

export type PostAccessError = {
  ok: false;
  status: number;
  code: string;
  message: string;
};

export type PostAccessSuccess = {
  ok: true;
  post: {
    id: string;
    authorId: string;
    visibility: PostVisibility;
  };
};

export type PostAccessResult = PostAccessSuccess | PostAccessError;

export async function ensurePostAccess(postId: string | undefined, viewerId: string | null): Promise<PostAccessResult> {
  if (!postId || postId.trim().length === 0) {
    return { ok: false, status: 400, code: "validation_error", message: "Gonderi kimligi gecersiz" };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, visibility: true },
  });

  if (!post) {
    return { ok: false, status: 404, code: "not_found", message: "Gonderi bulunamadi" };
  }

  if (post.visibility === PostVisibility.PUBLIC || post.authorId === viewerId) {
    return { ok: true, post };
  }

  if (!viewerId) {
    return { ok: false, status: 401, code: "unauthorized", message: "Yetkilendirme gerekli" };
  }

  if (post.visibility === PostVisibility.PRIVATE) {
    return { ok: false, status: 403, code: "forbidden", message: "Gonderiye erisim yetkiniz yok" };
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId: viewerId,
        followeeId: post.authorId,
      },
    },
    select: { status: true },
  });

  if (!follow || follow.status !== "ACCEPTED") {
    return { ok: false, status: 403, code: "forbidden", message: "Gonderiye erisim yetkiniz yok" };
  }

  return { ok: true, post };
}
