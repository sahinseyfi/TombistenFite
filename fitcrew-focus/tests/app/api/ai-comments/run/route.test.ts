import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { processNextAiCommentMock, formatAiJobInfoMock } = vi.hoisted(() => ({
  processNextAiCommentMock: vi.fn(),
  formatAiJobInfoMock: vi.fn((result: unknown) => result),
}));

vi.mock("@/env", () => ({
  env: {
    AI_COMMENT_CRON_SECRET: "cron-secret",
  },
}));

vi.mock("@/server/ai/comments", () => ({
  processNextAiComment: processNextAiCommentMock,
  formatAiJobInfo: formatAiJobInfoMock,
}));

import { POST } from "@/app/api/ai-comments/run/route";

function buildRequest(body?: unknown, headers?: Record<string, string>) {
  return new NextRequest("https://app.local/api/ai-comments/run", {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
  });
}

describe("POST /api/ai-comments/run", () => {
  beforeEach(() => {
    processNextAiCommentMock.mockReset();
    formatAiJobInfoMock.mockReset();
    formatAiJobInfoMock.mockImplementation((result: unknown) => result);
  });

  it("yetkisiz isteği reddeder", async () => {
    const response = await POST(buildRequest());
    expect(response.status).toBe(401);
    expect(processNextAiCommentMock).not.toHaveBeenCalled();
  });

  it("geçerli anahtar ile kuyruğu işler", async () => {
    processNextAiCommentMock
      .mockResolvedValueOnce({ processed: true, status: "success", postId: "post-1" })
      .mockResolvedValueOnce({ processed: false, status: "no_job" });

    const response = await POST(
      buildRequest({ count: 3 }, { authorization: "Bearer cron-secret" }),
    );

    expect(response.status).toBe(200);
    expect(processNextAiCommentMock).toHaveBeenCalledTimes(2);
    const body = await response.json();
    expect(body.processed).toBe(1);
  });

  it("geçersiz gövde için 422 döndürür", async () => {
    const response = await POST(
      buildRequest({ count: 0 }, { authorization: "Bearer cron-secret" }),
    );
    expect(response.status).toBe(422);
    expect(processNextAiCommentMock).not.toHaveBeenCalled();
  });
});
