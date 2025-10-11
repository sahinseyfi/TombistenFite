import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { buildMeasurementData } from "@/server/posts/utils";
import { serializeMeasurement } from "@/server/serializers/measurement";

const DEFAULT_LIMIT = 30;
const MIN_LIMIT = 5;
const MAX_LIMIT = 100;

const measurementMetricsSchema = z
  .object({
    waistCm: z.number().min(30).max(200).optional(),
    chestCm: z.number().min(30).max(200).optional(),
    hipCm: z.number().min(30).max(200).optional(),
    armCm: z.number().min(10).max(100).optional(),
    thighCm: z.number().min(20).max(150).optional(),
  })
  .strict();

const createMeasurementSchema = z
  .object({
    date: z.string().datetime().optional(),
    weightKg: z.number().min(20).max(400).optional(),
    metrics: measurementMetricsSchema.optional(),
  })
  .refine((data) => {
    const hasWeight = data.weightKg !== undefined;
    const hasMetrics = data.metrics ? Object.values(data.metrics).some((value) => value !== undefined) : false;
    return hasWeight || hasMetrics;
  }, "En az bir olcum degeri girilmelidir.");

const listQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().cuid().optional(),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(MIN_LIMIT).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

function clampLimit(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Olcum listesine erismek icin giris yapmalisiniz." }, 401);
  }

  const params = request.nextUrl.searchParams;
  const parsed = listQuerySchema.safeParse({
    startDate: params.get("startDate") ?? undefined,
    endDate: params.get("endDate") ?? undefined,
    userId: params.get("userId") ?? undefined,
    cursor: params.get("cursor") ?? undefined,
    limit: params.get("limit") ? Number.parseInt(params.get("limit")!, 10) : undefined,
  });

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Olcum sorgu parametreleri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const query = parsed.data;
  const viewerId = session.sub;
  const targetUserId = query.userId ?? viewerId;

  if (targetUserId !== viewerId) {
    return jsonError({ code: "forbidden", message: "Baska bir kullanicinin olcumlerine erisim izniniz yok." }, 403);
  }

  if (query.startDate && query.endDate) {
    if (new Date(query.startDate) > new Date(query.endDate)) {
      return jsonError({ code: "validation_error", message: "Baslangic tarihi bitis tarihinden sonra olamaz." }, 422);
    }
  }

  const limit = clampLimit(query.limit);

  if (query.cursor) {
    const exists = await prisma.measurement.findFirst({
      where: { id: query.cursor, userId: targetUserId },
      select: { id: true },
    });
    if (!exists) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const measurements = await prisma.measurement.findMany({
    where: {
      userId: targetUserId,
      ...(query.startDate || query.endDate
        ? {
            date: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
    take: limit + 1,
  });

  let nextCursor: string | undefined;
  if (measurements.length > limit) {
    const next = measurements.pop();
    if (next) {
      nextCursor = next.id;
    }
  }

  return jsonSuccess({
    measurements: measurements.map(serializeMeasurement),
    nextCursor,
  });
}

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Olcum eklemek icin giris yapmalisiniz." }, 401);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createMeasurementSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Olcum verileri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const measurementData = buildMeasurementData({
    weightKg: parsed.data.weightKg,
    measurements: parsed.data.metrics,
  });

  if (!measurementData) {
    return jsonError({ code: "validation_error", message: "En az bir olcum degeri zorunludur." }, 422);
  }

  const date = parsed.data.date ? new Date(parsed.data.date) : new Date();

  const measurement = await prisma.measurement.create({
    data: {
      userId: session.sub,
      date,
      ...measurementData,
    },
  });

  return jsonSuccess(
    {
      measurement: serializeMeasurement(measurement),
    },
    201,
  );
}
