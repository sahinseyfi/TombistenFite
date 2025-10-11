import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ReferralStatus } from "@prisma/client";

const { authenticateMock, getReferralDashboardMock, createReferralInviteMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  getReferralDashboardMock: vi.fn(),
  createReferralInviteMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/referrals/service", async () => {
  const actual = await vi.importActual<typeof import("@/server/referrals/service")>(
    "@/server/referrals/service",
  );
  return {
    ...actual,
    getReferralDashboard: getReferralDashboardMock,
    createReferralInvite: createReferralInviteMock,
  };
});

import { GET, POST } from "@/app/api/referrals/route";
import { ReferralDuplicateEmailError } from "@/server/referrals/service";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

type ReferralInviteRecord = {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeName: string | null;
  inviteCode: string;
  status: ReferralStatus;
  inviteeUserId: string | null;
  waitlistOptIn: boolean;
  acceptedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function createInvite(overrides?: Partial<ReferralInviteRecord>): ReferralInviteRecord {
  const fixedDate = new Date("2025-10-10T10:00:00.000Z");
  return {
    id: "referral-1",
    inviterId: "user-1",
    inviteeEmail: "friend@example.com",
    inviteeName: "Friend User",
    inviteCode: "CODE1234",
    status: ReferralStatus.PENDING,
    inviteeUserId: null,
    waitlistOptIn: false,
    acceptedAt: null,
    canceledAt: null,
    createdAt: fixedDate,
    updatedAt: fixedDate,
    ...(overrides ?? {}),
  };
}

describe("/api/referrals", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    getReferralDashboardMock.mockReset();
    createReferralInviteMock.mockReset();
  });

  describe("GET", () => {
    it("returns 401 when session is missing", async () => {
      authenticateMock.mockReturnValueOnce(null);

      const response = await GET(buildRequest("https://app.local/api/referrals"));

      expect(response.status).toBe(401);
      expect(getReferralDashboardMock).not.toHaveBeenCalled();
    });

    it("returns referral dashboard for authenticated user", async () => {
      authenticateMock.mockReturnValueOnce({ sub: "user-1" });
      getReferralDashboardMock.mockResolvedValueOnce({
        code: "ABCD1234",
        invites: [createInvite()],
        summary: { total: 1, accepted: 0, pending: 1 },
      });

      const response = await GET(buildRequest("https://app.local/api/referrals"));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.referral.code).toBe("ABCD1234");
      expect(body.referral.shareUrl).toBe("http://localhost:3000/davet?ref=ABCD1234");
      expect(body.summary).toEqual({ total: 1, accepted: 0, pending: 1 });
      expect(body.invites[0]).toMatchObject({
        inviteeEmail: "friend@example.com",
        status: "pending",
      });
    });
  });

  describe("POST", () => {
    it("requires authentication", async () => {
      authenticateMock.mockReturnValueOnce(null);

      const response = await POST(
        buildRequest("https://app.local/api/referrals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "invitee@example.com" }),
        }),
      );

      expect(response.status).toBe(401);
      expect(createReferralInviteMock).not.toHaveBeenCalled();
    });

    it("validates payload", async () => {
      authenticateMock.mockReturnValueOnce({ sub: "user-1" });

      const response = await POST(
        buildRequest("https://app.local/api/referrals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "not-an-email" }),
        }),
      );

      expect(response.status).toBe(422);
      expect(createReferralInviteMock).not.toHaveBeenCalled();
    });

    it("returns 409 when invite already exists", async () => {
      authenticateMock.mockReturnValueOnce({ sub: "user-1" });
      createReferralInviteMock.mockRejectedValueOnce(new ReferralDuplicateEmailError());

      const response = await POST(
        buildRequest("https://app.local/api/referrals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "friend@example.com" }),
        }),
      );

      expect(response.status).toBe(409);
      expect(createReferralInviteMock).toHaveBeenCalledWith({
        inviterId: "user-1",
        email: "friend@example.com",
        name: undefined,
        waitlistOptIn: undefined,
      });
    });

    it("creates invite and returns serialized response", async () => {
      authenticateMock.mockReturnValueOnce({ sub: "user-1" });
      createReferralInviteMock.mockResolvedValueOnce(
        createInvite({
          inviteeEmail: "newfriend@example.com",
          inviteeName: "New Friend",
          waitlistOptIn: true,
        }),
      );

      const response = await POST(
        buildRequest("https://app.local/api/referrals", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "newfriend@example.com",
            name: "New Friend",
            waitlistOptIn: true,
          }),
        }),
      );

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.invite.inviteeEmail).toBe("newfriend@example.com");
      expect(body.invite.waitlistOptIn).toBe(true);
      expect(body.invite.status).toBe("pending");

      expect(createReferralInviteMock).toHaveBeenCalledWith({
        inviterId: "user-1",
        email: "newfriend@example.com",
        name: "New Friend",
        waitlistOptIn: true,
      });
    });
  });
});
