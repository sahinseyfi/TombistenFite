import { Prisma } from "@prisma/client";
import { formatISO } from "date-fns";
import { getOpenAIClient, getAiModel } from "@/server/ai/client";
import { buildAiCommentPrompt } from "@/server/ai/prompts";
import { prisma } from "@/server/db";
import { queueNotificationsForEvent } from "@/server/notifications";

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

type ParseResult = {
  summary: string;
  tips: string[];
};

function decimalToNumber(value: DecimalLike) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function sanitizeTips(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((tip) => (typeof tip === "string" ? tip.trim() : ""))
    .filter((tip) => tip.length > 0)
    .slice(0, 3);
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```json([\s\S]*?)```/i) ?? trimmed.match(/```([\s\S]*?)```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return trimmed.slice(jsonStart, jsonEnd + 1);
  }

  return trimmed;
}

function parseAiResponse(raw: string): ParseResult {
  const payload = extractJsonPayload(raw);
  const data = JSON.parse(payload);
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";

  if (!summary) {
    throw new Error("AI yanıtında summary alanı bulunamadı.");
  }

  const tips = sanitizeTips(data.tips);

  return {
    summary,
    tips,
  };
}

export async function processNextAiComment(now = new Date()) {
  const post = await prisma.post.findFirst({
    where: {
      aiCommentRequested: true,
      aiCommentStatus: "PENDING",
    },
    orderBy: [{ aiCommentUpdatedAt: "asc" }, { createdAt: "asc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          handle: true,
        },
      },
      measurement: {
        select: {
          date: true,
          weightKg: true,
          waistCm: true,
          chestCm: true,
          hipCm: true,
          armCm: true,
          thighCm: true,
        },
      },
    },
  });

  if (!post) {
    return { processed: false, status: "no_job" as const };
  }

  const client = getOpenAIClient();
  if (!client) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        aiCommentStatus: "FAILED",
        aiCommentError: "AI servisi yapılandırılmadı.",
        aiCommentUpdatedAt: now,
      },
    });
    return { processed: false, status: "missing_config" as const, postId: post.id };
  }

  try {
    const measurementHistory = await prisma.measurement.findMany({
      where: {
        userId: post.authorId,
        date: { lte: post.createdAt },
      },
      orderBy: { date: "desc" },
      take: 7,
      select: {
        date: true,
        weightKg: true,
        waistCm: true,
        chestCm: true,
        hipCm: true,
        armCm: true,
        thighCm: true,
      },
    });

    const prompt = buildAiCommentPrompt({
      user: {
        name: post.author.name,
        handle: post.author.handle,
      },
      post: {
        createdAt: post.createdAt,
        caption: post.caption,
        mealType: post.mealType ? post.mealType.toLowerCase() : null,
        weightKg: decimalToNumber(post.weightKg),
        photos: post.photos,
      },
      latestMeasurement: post.measurement
        ? {
            date: post.measurement.date,
            weightKg: decimalToNumber(post.measurement.weightKg),
            waistCm: decimalToNumber(post.measurement.waistCm),
            chestCm: decimalToNumber(post.measurement.chestCm),
            hipCm: decimalToNumber(post.measurement.hipCm),
            armCm: decimalToNumber(post.measurement.armCm),
            thighCm: decimalToNumber(post.measurement.thighCm),
          }
        : undefined,
      measurementHistory: measurementHistory
        .map((measurement) => ({
          date: measurement.date,
          weightKg: decimalToNumber(measurement.weightKg),
          waistCm: decimalToNumber(measurement.waistCm),
          chestCm: decimalToNumber(measurement.chestCm),
          hipCm: decimalToNumber(measurement.hipCm),
          armCm: decimalToNumber(measurement.armCm),
          thighCm: decimalToNumber(measurement.thighCm),
        }))
        .reverse(),
    });

    const completion = await client.chat.completions.create({
      model: getAiModel(),
      temperature: 0.4,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "Sen FitCrew uygulaması için çalışan destekleyici bir koçsun. Kullanıcının gönderisini özetleyip motive edici ve eyleme dönük öneriler ver. Tıbbi tavsiye verme ve çıktıyı geçerli JSON olarak döndür.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content ?? "";
    const parsed = parseAiResponse(typeof content === "string" ? content : JSON.stringify(content));

    await prisma.post.update({
      where: { id: post.id },
      data: {
        aiCommentStatus: "READY",
        aiCommentSummary: parsed.summary,
        aiCommentTips: parsed.tips,
        aiCommentError: null,
        aiCommentUpdatedAt: now,
      },
    });

    await queueNotificationsForEvent({
      kind: "ai_comment_ready",
      postId: post.id,
      summary: parsed.summary,
    });

    return { processed: true, status: "success" as const, postId: post.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "AI yorum üretimi sırasında beklenmeyen bir hata oluştu.";

    await prisma.post.update({
      where: { id: post.id },
      data: {
        aiCommentStatus: "FAILED",
        aiCommentError: errorMessage,
        aiCommentUpdatedAt: now,
      },
    });

    return { processed: false, status: "failed" as const, postId: post.id, error: errorMessage };
  }
}

export async function resetAiComment(postId: string, now = new Date()) {
  return prisma.post.update({
    where: { id: postId },
    data: {
      aiCommentRequested: true,
      aiCommentStatus: "PENDING",
      aiCommentSummary: null,
      aiCommentTips: [],
      aiCommentError: null,
      aiCommentUpdatedAt: now,
    },
    select: {
      id: true,
      authorId: true,
      aiCommentStatus: true,
    },
  });
}

export function formatAiJobInfo(result: Awaited<ReturnType<typeof processNextAiComment>>) {
  if (!result.postId) {
    return { status: result.status };
  }

  return {
    status: result.status,
    postId: result.postId,
    error: result.error,
    processedAt: formatISO(new Date(), { representation: "complete" }),
  };
}
