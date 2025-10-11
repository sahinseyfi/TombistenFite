import { describe, it, expect, beforeEach, vi } from "vitest";

const {
  postFindFirstMock,
  measurementFindManyMock,
  postUpdateMock,
  getOpenAIClientMock,
  getAiModelMock,
  openAiChatCompletionMock,
  queueNotificationsMock,
} = vi.hoisted(() => {
  const openAiChatCompletionMock = vi.fn();

  return {
    postFindFirstMock: vi.fn(),
    measurementFindManyMock: vi.fn(),
    postUpdateMock: vi.fn(),
    getOpenAIClientMock: vi.fn(() => ({
      chat: {
        completions: {
          create: openAiChatCompletionMock,
        },
      },
    })),
    getAiModelMock: vi.fn(() => "gpt-4o-mini"),
    openAiChatCompletionMock,
    queueNotificationsMock: vi.fn().mockResolvedValue({ created: 1 }),
  };
});

vi.mock("@/server/db", () => ({
  prisma: {
    post: {
      findFirst: postFindFirstMock,
      update: postUpdateMock,
    },
    measurement: {
      findMany: measurementFindManyMock,
    },
  },
}));

vi.mock("@/server/ai/client", () => ({
  getOpenAIClient: getOpenAIClientMock,
  getAiModel: getAiModelMock,
}));

vi.mock("@/server/notifications", () => ({
  queueNotificationsForEvent: queueNotificationsMock,
}));

import { processNextAiComment, resetAiComment } from "@/server/ai/comments";

const baseDate = new Date("2025-10-10T12:00:00.000Z");

type PendingPost = {
  id: string;
  authorId: string;
  createdAt: Date;
  caption: string;
  photos: string[];
  mealType: string;
  weightKg: string;
  aiCommentRequested: boolean;
  aiCommentStatus: "PENDING" | "READY" | "FAILED" | "IDLE";
  aiCommentUpdatedAt: Date | null;
  author: {
    id: string;
    name: string;
    handle: string;
  };
  measurement: {
    date: Date;
    weightKg: string | null;
    waistCm: string | null;
    chestCm: string | null;
    hipCm: string | null;
    armCm: string | null;
    thighCm: string | null;
  };
};

function buildPost(overrides?: Partial<PendingPost>): PendingPost {
  return {
    id: "post-1",
    authorId: "user-1",
    createdAt: baseDate,
    caption: "Bugünkü öğünüm",
    photos: ["https://cdn.local/p1.jpg"],
    mealType: "DINNER",
    weightKg: "80.2",
    aiCommentRequested: true,
    aiCommentStatus: "PENDING",
    aiCommentUpdatedAt: null,
    author: {
      id: "user-1",
      name: "Ayşe Fit",
      handle: "aysefit",
    },
    measurement: {
      date: baseDate,
      weightKg: "80.2",
      waistCm: "72.4",
      chestCm: null,
      hipCm: "95.1",
      armCm: null,
      thighCm: null,
    },
    ...overrides,
  };
}

describe("processNextAiComment", () => {
  beforeEach(() => {
    postFindFirstMock.mockReset();
    measurementFindManyMock.mockReset();
    postUpdateMock.mockReset();
    getOpenAIClientMock.mockClear();
    getAiModelMock.mockClear();
    openAiChatCompletionMock.mockReset();
    queueNotificationsMock.mockReset();
  });

  it("AI servisi yapılandırılmadığında postu failed olarak işaretler", async () => {
    postFindFirstMock.mockResolvedValueOnce(buildPost());
    getOpenAIClientMock.mockReturnValueOnce(null);

    const result = await processNextAiComment(baseDate);

    expect(result.status).toBe("missing_config");
    expect(postUpdateMock).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        aiCommentStatus: "FAILED",
        aiCommentError: "AI servisi yapılandırılmadı.",
        aiCommentUpdatedAt: baseDate,
      },
    });
  });

  it("başarılı şekilde AI yorumu üretir ve postu günceller", async () => {
    postFindFirstMock.mockResolvedValueOnce(buildPost());
    measurementFindManyMock.mockResolvedValueOnce([
      {
        date: baseDate,
        weightKg: "80.2",
        waistCm: "72.4",
        chestCm: null,
        hipCm: "95.1",
        armCm: null,
        thighCm: null,
      },
    ]);

    openAiChatCompletionMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              summary: "Harika bir ilerleme! AI yorum içerikleri tıbbi tavsiye değildir.",
              tips: ["Su tüketimini artır."],
            }),
          },
        },
      ],
    });

    const result = await processNextAiComment(baseDate);

    expect(result).toEqual({ processed: true, status: "success", postId: "post-1" });
    expect(postUpdateMock).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: {
        aiCommentStatus: "READY",
        aiCommentSummary: expect.stringContaining("Harika bir ilerleme"),
        aiCommentTips: ["Su tüketimini artır."],
        aiCommentError: null,
        aiCommentUpdatedAt: baseDate,
      },
    });
    expect(queueNotificationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "ai_comment_ready",
        postId: "post-1",
      }),
    );
  });

  it("yanıt parse edilemezse postu failed olarak günceller", async () => {
    postFindFirstMock.mockResolvedValueOnce(buildPost());
    measurementFindManyMock.mockResolvedValueOnce([]);

    openAiChatCompletionMock.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Geçersiz çıktı",
          },
        },
      ],
    });

    const result = await processNextAiComment(baseDate);

    expect(result.status).toBe("failed");
    expect(postUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "post-1" },
        data: expect.objectContaining({
          aiCommentStatus: "FAILED",
          aiCommentError: expect.any(String),
          aiCommentUpdatedAt: baseDate,
        }),
      }),
    );
  });
});

describe("resetAiComment", () => {
  beforeEach(() => {
    postUpdateMock.mockReset();
  });

  it("gönderiyi yeniden kuyruğa alır", async () => {
    postUpdateMock.mockResolvedValueOnce({
      id: "post-1",
      authorId: "user-1",
      aiCommentStatus: "PENDING",
    });

    const now = new Date("2025-10-11T12:00:00.000Z");
    const result = await resetAiComment("post-1", now);

    expect(postUpdateMock).toHaveBeenCalledWith({
      where: { id: "post-1" },
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

    expect(result).toEqual({
      id: "post-1",
      authorId: "user-1",
      aiCommentStatus: "PENDING",
    });
  });
});
