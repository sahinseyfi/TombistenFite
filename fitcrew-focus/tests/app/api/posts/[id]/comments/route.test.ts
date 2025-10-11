import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  commentFindMany,
  commentFindUnique,
  commentCreateTx,
  postUpdateTx,
  transactionMock,
  ensureAccessMock,
  authenticateMock,
  consumeRateLimitMock,
  buildRateLimitHeadersMock,
  getCommentsLimitMock,
  queueNotificationsMock,
} = vi.hoisted(() => ({
  commentFindMany: vi.fn(),
  commentFindUnique: vi.fn(),
  commentCreateTx: vi.fn(),
  postUpdateTx: vi.fn(),
  transactionMock: vi.fn(),
  ensureAccessMock: vi.fn(),
  authenticateMock: vi.fn(),
  consumeRateLimitMock: vi.fn(),
  buildRateLimitHeadersMock: vi.fn(),
  getCommentsLimitMock: vi.fn().mockReturnValue(20),
  queueNotificationsMock: vi.fn().mockResolvedValue({ created: 0 }),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    comment: {
      findMany: commentFindMany,
      findUnique: commentFindUnique,
    },
    $transaction: transactionMock,
  },
}));

vi.mock("@/server/posts/utils", async () => {
  const actual = await vi.importActual<typeof import("@/server/posts/utils")>("@/server/posts/utils");
  return {
    ...actual,
    ensurePostAccess: ensureAccessMock,
  };
});

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/rate-limit", () => ({
  consumeRateLimit: consumeRateLimitMock,
  buildRateLimitHeaders: buildRateLimitHeadersMock,
  getCommentsPerMinuteLimit: getCommentsLimitMock,
}));

vi.mock("@/server/notifications", () => ({
  queueNotificationsForEvent: queueNotificationsMock,
}));

import { GET, POST } from "@/app/api/posts/[id]/comments/route";

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

const baseDate = new Date("2025-10-10T12:00:00.000Z");

function createComment(id: string) {
  return {
    id,
    postId: "post-1",
    authorId: "author-1",
    body: `yorum-${id}`,
    createdAt: baseDate,
    updatedAt: baseDate,
    author: {
      id: "author-1",
      handle: "fitcrew",
      name: "Fit Crew",
      avatarUrl: null,
    },
  };
}

describe("GET /api/posts/[id]/comments", () => {
  beforeEach(() => {
    commentFindMany.mockReset();
    commentFindUnique.mockReset();
    commentCreateTx.mockReset();
    postUpdateTx.mockReset();
    transactionMock.mockReset();
    ensureAccessMock.mockReset();
    authenticateMock.mockReset();
    consumeRateLimitMock.mockReset();
    buildRateLimitHeadersMock.mockReset();
    getCommentsLimitMock.mockReset();
    getCommentsLimitMock.mockReturnValue(20);
    consumeRateLimitMock.mockResolvedValue(null);
    buildRateLimitHeadersMock.mockImplementation(() => undefined);
    queueNotificationsMock.mockReset();
});

  it("erişim reddedildiginde ensurePostAccess cevabini dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      code: "forbidden",
      message: "Bu gonderiye erisim yetkiniz yok.",
    });

    const response = await GET(buildRequest("https://app.local/api/posts/post-1/comments"), {
      params: { id: "post-1" },
    } as any);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("forbidden");
    expect(commentFindMany).not.toHaveBeenCalled();
  });

  it("gecersiz cursor icin 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: true,
      post: { id: "post-1", authorId: "author-1", visibility: "PUBLIC" },
    });
    commentFindUnique.mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest("https://app.local/api/posts/post-1/comments?cursor=missing"),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
    expect(commentFindMany).not.toHaveBeenCalled();
  });

  it("cursor bazli sayfalama icin nextCursor dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: true,
      post: { id: "post-1", authorId: "author-1", visibility: "PUBLIC" },
    });

    const comments = Array.from({ length: 6 }, (_, index) => createComment(`c${index + 1}`));
    commentFindMany.mockResolvedValueOnce([...comments]);
    const response = await GET(
      buildRequest("https://app.local/api/posts/post-1/comments?limit=5"),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.comments).toHaveLength(5);
    expect(body.comments[0].id).toBe("c1");
    expect(body.comments[0].body).toBe("yorum-c1");
    expect(body.nextCursor).toBe("c6");

    expect(commentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { postId: "post-1" },
        take: 6,
      }),
    );
  });
});

describe("POST /api/posts/[id]/comments", () => {
  beforeEach(() => {
    commentFindMany.mockReset();
    commentFindUnique.mockReset();
    commentCreateTx.mockReset();
    postUpdateTx.mockReset();
    transactionMock.mockReset();
    ensureAccessMock.mockReset();
    authenticateMock.mockReset();
    consumeRateLimitMock.mockReset();
    buildRateLimitHeadersMock.mockReset();
    getCommentsLimitMock.mockReset();
    getCommentsLimitMock.mockReturnValue(20);
    consumeRateLimitMock.mockResolvedValue(null);
    buildRateLimitHeadersMock.mockImplementation(() => undefined);
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await POST(
      buildRequest("https://app.local/api/posts/post-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "Merhaba" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("unauthorized");
  });

  it("bos yorum icin 422 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "author-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: true,
      post: { id: "post-1", authorId: "author-1", visibility: "PUBLIC" },
    });

    const response = await POST(
      buildRequest("https://app.local/api/posts/post-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "   " }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
  });

  it("yorumu olusturup sayaci arttirir", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "author-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: true,
      post: { id: "post-1", authorId: "author-1", visibility: "PUBLIC" },
    });
    const rateHeaders = {
      "X-RateLimit-Limit": "20",
      "X-RateLimit-Remaining": "19",
      "X-RateLimit-Reset": "1700000000",
    };
    const limitResult = {
      ok: true,
      limit: 20,
      remaining: 19,
      resetAt: 1700000000 * 1000,
      hitCount: 1,
    };
    consumeRateLimitMock.mockResolvedValueOnce(limitResult);
    buildRateLimitHeadersMock.mockReturnValueOnce(rateHeaders);

    commentCreateTx.mockResolvedValueOnce(createComment("c10"));
    transactionMock.mockImplementation(async (callback) =>
      callback({
        comment: { create: commentCreateTx },
        post: { update: postUpdateTx },
      } as any),
    );

    const response = await POST(
      buildRequest("https://app.local/api/posts/post-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "  Yorum " }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-ratelimit-limit")).toBe("20");
    const body = await response.json();
    expect(body.comment.id).toBe("c10");
    expect(body.comment.body).toBe("yorum-c10");

    expect(commentCreateTx).toHaveBeenCalledWith({
      data: {
        postId: "post-1",
        authorId: "author-1",
        body: "Yorum",
      },
      include: {
        author: { select: { id: true, handle: true, name: true, avatarUrl: true } },
      },
    });
    expect(postUpdateTx).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { commentsCount: { increment: 1 } },
    });
    expect(buildRateLimitHeadersMock).toHaveBeenCalledWith(limitResult);
    expect(queueNotificationsMock).toHaveBeenCalledWith({
      kind: "post_comment",
      actorId: "author-1",
      postId: "post-1",
      commentId: "c10",
      commentBody: "yorum-c10",
    });
  });

  it("rate limit asildiginda 429 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "author-1" });
    ensureAccessMock.mockResolvedValueOnce({
      ok: true,
      post: { id: "post-1", authorId: "author-1", visibility: "PUBLIC" },
    });

    const limitResult = {
      ok: false,
      limit: 20,
      remaining: 0,
      resetAt: 1700001000 * 1000,
      hitCount: 21,
    };
    consumeRateLimitMock.mockResolvedValueOnce(limitResult);
    buildRateLimitHeadersMock.mockReturnValueOnce({
      "X-RateLimit-Limit": "20",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": "1700001000",
      "Retry-After": "60",
    });

    const response = await POST(
      buildRequest("https://app.local/api/posts/post-1/comments", {
        method: "POST",
        body: JSON.stringify({ body: "Rate limit test" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "post-1" } } as any,
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("x-ratelimit-limit")).toBe("20");
    const body = await response.json();
    expect(body.error.code).toBe("rate_limited");
    expect(buildRateLimitHeadersMock).toHaveBeenCalledWith(limitResult);
  });
});
