import { NextRequest } from "next/server";
import { z } from "zod";
import { TreatPortion } from "@prisma/client";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { serializeTreatSpin } from "@/server/serializers/treat";
import { computeEligibility, type EligibilityResult } from "@/server/treats/eligibility";
import { getTreatConfig } from "@/server/treats/config";
import { buildSeed, pickIndex, pickWeighted } from "@/server/treats/rng";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
  getSpinsPerDayLimit,
} from "@/server/rate-limit";
import { prisma } from "@/server/db";
import { queueNotificationsForEvent } from "@/server/notifications";

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 5;
const MAX_LIMIT = 50;

const listQuerySchema = z.object({
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().min(MIN_LIMIT).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

const createSpinSchema = z.object({
  clientSeed: z.string().trim().min(1).max(128).optional(),
});

function clampLimit(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(value, MIN_LIMIT), MAX_LIMIT);
}

function translateEligibilityMessage(eligibility: EligibilityResult) {
  switch (eligibility.reason) {
    case "COOLDOWN":
      return "Carki yeniden cevirebilmek icin biraz daha beklemelisiniz.";
    case "LIMIT_REACHED":
      return "Bu hafta icin azami cark hakkinizi kullandiniz.";
    case "NEED_MORE_LOSS":
      if (eligibility.reasonParams?.kgNeeded) {
        return `Yeni bir kacamak icin ${eligibility.reasonParams.kgNeeded} kg daha ilerleme gerekiyor.`;
      }
      return "Hedeflenen kilo ilerlemesi henuz yakalanmadi.";
    case "INSUFFICIENT_MEASUREMENTS":
      return "Son gunlerde yeterli olcum bulunmadigi icin spinning kilitlendi.";
    case "ANOMALY":
      return "Olcum verilerinde tutarsizlik saptandi. Lutfen verilerinizi kontrol edin.";
    default:
      return "Treat Wheel su anda kullanilamiyor.";
  }
}

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Cark gecmisini gormek icin giris yapmalisiniz." }, 401);
  }

  const params = request.nextUrl.searchParams;
  const parsed = listQuerySchema.safeParse({
    cursor: params.get("cursor") ?? undefined,
    limit: params.get("limit") ? Number.parseInt(params.get("limit")!, 10) : undefined,
  });

  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Spin listeleme parametreleri dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const query = parsed.data;
  const limit = clampLimit(query.limit);

  if (query.cursor) {
    const cursorExists = await prisma.treatSpin.findFirst({
      where: { id: query.cursor, userId: session.sub },
      select: { id: true },
    });
    if (!cursorExists) {
      return jsonError({ code: "invalid_cursor", message: "Gecersiz cursor parametresi belirtildi." }, 400);
    }
  }

  const spins = await prisma.treatSpin.findMany({
    where: { userId: session.sub },
    orderBy: [{ spunAt: "desc" }, { id: "desc" }],
    cursor: query.cursor ? { id: query.cursor } : undefined,
    skip: query.cursor ? 1 : 0,
    take: limit + 1,
  });

  let nextCursor: string | undefined;
  if (spins.length > limit) {
    const next = spins.pop();
    if (next) {
      nextCursor = next.id;
    }
  }

  return jsonSuccess(
    {
      spins: spins.map(serializeTreatSpin),
      nextCursor,
    },
    { request },
  );
}

export async function POST(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Carki cevirmek icin giris yapmalisiniz." }, 401);
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return jsonError({ code: "invalid_body", message: "Gecersiz JSON govdesi alindi." }, 400);
  }

  const parsed = createSpinSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(
      {
        code: "validation_error",
        message: "Spin istegi dogrulanamadi.",
        details: parsed.error.flatten(),
      },
      422,
    );
  }

  const rateLimitResult = await consumeRateLimit({
    identifier: `treats:spins:${session.sub}`,
    limit: getSpinsPerDayLimit(),
    windowMs: 86_400_000,
  });
  const rateLimitHeaders = buildRateLimitHeaders(rateLimitResult);

  if (rateLimitResult && !rateLimitResult.ok) {
    return jsonError(
      {
        code: "rate_limited",
        message: `Gun icinde en fazla ${rateLimitResult.limit} kez carki cevirebilirsiniz.`,
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

  const [items, eligibility] = await Promise.all([
    prisma.treatItem.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "asc" },
    }),
    computeEligibility(session.sub),
  ]);

  if (items.length === 0) {
    return jsonError(
      {
        code: "not_allowed",
        message: "Carki kullanmadan once en az bir kacamak eklemelisiniz.",
      },
      400,
    );
  }

  if (!eligibility.eligible) {
    return jsonError(
      {
        code: "eligibility_failed",
        message: translateEligibilityMessage(eligibility),
        details: { eligibility },
      },
      403,
    );
  }

  const seed = buildSeed(parsed.data.clientSeed);
  const selectedIndex = pickIndex(items.length, seed, "treat");
  const selectedItem = items[selectedIndex];
  const itemPortions =
    selectedItem.portions.length > 0
      ? selectedItem.portions
      : [TreatPortion.SMALL, TreatPortion.MEDIUM, TreatPortion.FULL];
  const portionIndex = pickIndex(itemPortions.length, seed, "portion");
  const selectedPortion = itemPortions[portionIndex];

  const config = getTreatConfig();
  const bonusWalkMin = pickWeighted(
    config.bonusDistribution.values,
    config.bonusDistribution.weights,
    seed,
    "bonus",
  );

  const created = await prisma.treatSpin.create({
    data: {
      userId: session.sub,
      treatItemId: selectedItem.id,
      treatNameSnapshot: selectedItem.name,
      photoUrlSnapshot: selectedItem.photoUrl,
      kcalHintSnapshot: selectedItem.kcalHint,
      portion: selectedPortion,
      bonusWalkMin,
    },
  });

  await queueNotificationsForEvent({
    kind: "treat_bonus",
    userId: session.sub,
    spinId: created.id,
    treatName: created.treatNameSnapshot,
    bonusWalkMin: created.bonusWalkMin,
    photoUrl: created.photoUrlSnapshot,
  });

  return jsonSuccess(
    { spin: serializeTreatSpin(created) },
    {
      status: 201,
      headers: rateLimitHeaders,
    },
  );
}
