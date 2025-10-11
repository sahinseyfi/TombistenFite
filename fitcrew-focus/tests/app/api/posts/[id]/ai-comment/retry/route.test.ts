import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  postFindUniqueMock,
  resetAiCommentMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  postFindUniqueMock: vi.fn(),
  resetAiCommentMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    post: {
      findUnique: postFindUniqueMock,
    },
  },
}));

vi.mock("@/server/ai/comments", () => ({
  resetAiComment: resetAiCommentMock,
}));

import { POST } from "@/app/api/posts/[id]/ai-comment/retry/route";

function buildRequest(method = "POST") {
  return new NextRequest("https://app.local/api/posts/post-1/ai-comment/retry", { method });
}

describe("POST /api/posts/[id]/ai-comment/retry", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    postFindUniqueMock.mockReset();
    resetAiCommentMock.mockReset();
  });

  it("kimliği doğrulanmamış isteği reddeder", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await POST(buildRequest(), { params: { id: "post-1" } });
    expect(response.status).toBe(401);
    expect(postFindUniqueMock).not.toHaveBeenCalled();
  });

  it("gönderi bulunamazsa 404 döndürür", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    postFindUniqueMock.mockResolvedValueOnce(null);

    const response = await POST(buildRequest(), { params: { id: "post-1" } });
    expect(response.status).toBe(404);
  });

  it("başka bir kullanıcının gönderisi için 403 döndürür", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-2" });
    postFindUniqueMock.mockResolvedValueOnce({
      id: "post-1",
      authorId: "user-1",
      aiCommentRequested: true,
    });

    const response = await POST(buildRequest(), { params: { id: "post-1" } });
    expect(response.status).toBe(403);
    expect(resetAiCommentMock).not.toHaveBeenCalled();
  });

  it("gönderiyi yeniden kuyruğa alır", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    postFindUniqueMock.mockResolvedValueOnce({
      id: "post-1",
      authorId: "user-1",
      aiCommentRequested: true,
    });
    resetAiCommentMock.mockResolvedValueOnce({
      id: "post-1",
      aiCommentStatus: "PENDING",
    });

    const response = await POST(buildRequest(), { params: { id: "post-1" } });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.postId).toBe("post-1");
    expect(body.status).toBe("PENDING");
  });
});
