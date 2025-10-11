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
} = vi.hoisted(() => ({
  commentFindMany: vi.fn(),
  commentFindUnique: vi.fn(),
  commentCreateTx: vi.fn(),
  postUpdateTx: vi.fn(),
  transactionMock: vi.fn(),
  ensureAccessMock: vi.fn(),
  authenticateMock: vi.fn(),
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
  });
});
