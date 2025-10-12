import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/waitlist/route";

const {
  envMock,
  handleWaitlistWebhookMock,
  verifyWaitlistSignatureMock,
} = vi.hoisted(() => ({
  envMock: {
    WAITLIST_WEBHOOK_SECRET: "waitlist-secret",
  } as { WAITLIST_WEBHOOK_SECRET?: string },
  handleWaitlistWebhookMock: vi.fn(),
  verifyWaitlistSignatureMock: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: envMock,
}));

vi.mock("@/server/referrals/waitlist", () => ({
  handleWaitlistWebhook: handleWaitlistWebhookMock,
  verifyWaitlistSignature: verifyWaitlistSignatureMock,
}));

beforeEach(() => {
  envMock.WAITLIST_WEBHOOK_SECRET = "waitlist-secret";
  handleWaitlistWebhookMock.mockReset();
  verifyWaitlistSignatureMock.mockReset();
});

function buildRequest(body: unknown, headers?: Record<string, string>) {
  return new NextRequest("https://app.local/api/webhooks/waitlist", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/webhooks/waitlist", () => {
  it("returns 503 when webhook secret is missing", async () => {
    envMock.WAITLIST_WEBHOOK_SECRET = undefined;

    const request = buildRequest({});
    const response = await POST(request);

    expect(response.status).toBe(503);
    const payload = await response.json();
    expect(payload.error.code).toBe("webhook_disabled");
  });

  it("rejects invalid signatures", async () => {
    envMock.WAITLIST_WEBHOOK_SECRET = "waitlist-secret";
    verifyWaitlistSignatureMock.mockReturnValueOnce(false);

    const request = buildRequest({}, { "x-waitlist-signature": "invalid" });
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleWaitlistWebhookMock).not.toHaveBeenCalled();
  });

  it("processes webhook payload and returns handler result", async () => {
    envMock.WAITLIST_WEBHOOK_SECRET = "waitlist-secret";
    verifyWaitlistSignatureMock.mockReturnValueOnce(true);
    handleWaitlistWebhookMock.mockResolvedValueOnce({
      status: "updated",
      action: "subscribed",
      updated: 1,
    });

    const request = buildRequest(
      { event: "contact.subscribed", data: { email: "friend@example.com" } },
      { "x-waitlist-signature": "valid" },
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: "updated", action: "subscribed", updated: 1 });
    expect(handleWaitlistWebhookMock).toHaveBeenCalledWith(
      expect.objectContaining({ event: "contact.subscribed" }),
    );
  });

  it("returns 404 when handler finds no matching invite", async () => {
    envMock.WAITLIST_WEBHOOK_SECRET = "waitlist-secret";
    verifyWaitlistSignatureMock.mockReturnValueOnce(true);
    handleWaitlistWebhookMock.mockResolvedValueOnce({
      status: "not_found",
      action: "subscribed",
    });

    const response = await POST(
      buildRequest({ event: "contact.subscribed", data: { email: "missing@example.com" } }, { "x-waitlist-signature": "valid" }),
    );

    expect(response.status).toBe(404);
  });
});
