import { createHmac } from "node:crypto";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ReferralStatus } from "@prisma/client";
import {
  handleWaitlistWebhook,
  registerWaitlistOptIn,
  verifyWaitlistSignature,
} from "@/server/referrals/waitlist";

const {
  envMock,
  referralInviteUpdateMock,
  referralInviteUpdateManyMock,
} = vi.hoisted(() => ({
  envMock: {
    RESEND_API_KEY: "test-resend-key",
    RESEND_WAITLIST_AUDIENCE_ID: "audience-1",
    WAITLIST_WEBHOOK_SECRET: "waitlist-secret",
  } as {
    RESEND_API_KEY?: string;
    RESEND_WAITLIST_AUDIENCE_ID?: string;
    WAITLIST_WEBHOOK_SECRET?: string;
  },
  referralInviteUpdateMock: vi.fn(),
  referralInviteUpdateManyMock: vi.fn(),
}));

vi.mock("@/env", () => ({
  env: envMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    referralInvite: {
      update: referralInviteUpdateMock,
      updateMany: referralInviteUpdateManyMock,
    },
  },
}));

const baseInvite = {
  id: "invite-1",
  inviterId: "user-1",
  inviteeEmail: "friend@example.com",
  inviteeName: "Friend User",
  inviteCode: "CODE1234",
  status: ReferralStatus.PENDING,
  inviteeUserId: null,
  waitlistOptIn: true,
  waitlistProvider: null,
  waitlistSubscriberId: null,
  waitlistSubscribedAt: null,
  inviteEmailSentAt: null,
  inviteEmailProviderId: null,
  acceptedAt: null,
  canceledAt: null,
  createdAt: new Date("2025-10-10T10:00:00.000Z"),
  updatedAt: new Date("2025-10-10T10:00:00.000Z"),
};

const originalFetch = global.fetch;

beforeEach(() => {
  envMock.RESEND_API_KEY = "test-resend-key";
  envMock.RESEND_WAITLIST_AUDIENCE_ID = "audience-1";
  envMock.WAITLIST_WEBHOOK_SECRET = "waitlist-secret";
  referralInviteUpdateMock.mockReset();
  referralInviteUpdateManyMock.mockReset();
  global.fetch = vi.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("registerWaitlistOptIn", () => {
  it("skips registration when configuration is missing", async () => {
    envMock.RESEND_API_KEY = undefined as unknown as string;

    const result = await registerWaitlistOptIn(
      { ...baseInvite, waitlistOptIn: true },
      {
        inviterId: "user-1",
        inviterHandle: "aysefit",
        inviterName: "Ayse Fit",
        referralCode: "INVITER01",
      },
    );

    expect(result).toEqual({ registered: false, reason: "missing_configuration" });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(referralInviteUpdateMock).not.toHaveBeenCalled();
  });

  it("registers contact with Resend audience and updates invite", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "contact-1" }),
    });

    const result = await registerWaitlistOptIn(baseInvite, {
      inviterId: "user-1",
      inviterHandle: "aysefit",
      inviterName: "Ayse Fit",
      referralCode: "INVITER01",
    });

    expect(result).toEqual({ registered: true, contactId: "contact-1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/contacts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-resend-key",
        }),
      }),
    );
    expect(referralInviteUpdateMock).toHaveBeenCalledWith({
      where: { id: "invite-1" },
      data: expect.objectContaining({
        waitlistProvider: "resend",
        waitlistSubscriberId: "contact-1",
      }),
    });
  });
});

describe("handleWaitlistWebhook", () => {
  it("updates invite on subscribed event", async () => {
    referralInviteUpdateManyMock.mockResolvedValueOnce({ count: 1 });

    const result = await handleWaitlistWebhook({
      event: "contact.subscribed",
      id: "contact-1",
      data: {
        email: "Friend@example.com",
        subscribedAt: "2025-10-10T12:00:00.000Z",
      },
    });

    expect(result).toEqual({ status: "updated", action: "subscribed", updated: 1 });
    expect(referralInviteUpdateManyMock).toHaveBeenCalledWith({
      where: { inviteeEmail: "friend@example.com" },
      data: expect.objectContaining({
        waitlistOptIn: true,
        waitlistSubscriberId: "contact-1",
      }),
    });
  });

  it("ignores events without email", async () => {
    const result = await handleWaitlistWebhook({
      event: "contact.subscribed",
      data: {},
    });
    expect(result).toEqual({ status: "ignored", reason: "missing_email" });
    expect(referralInviteUpdateManyMock).not.toHaveBeenCalled();
  });
});

describe("verifyWaitlistSignature", () => {
  it("validates sha256 signature using shared secret", () => {
    const payload = JSON.stringify({ ping: true });
    const hmac = createHmac("sha256", envMock.WAITLIST_WEBHOOK_SECRET)
      .update(payload, "utf8")
      .digest("hex");
    const isValid = verifyWaitlistSignature(payload, hmac);
    expect(isValid).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const payload = JSON.stringify({ ping: true });
    const isValid = verifyWaitlistSignature(payload, "deadbeef");
    expect(isValid).toBe(false);
  });
});
