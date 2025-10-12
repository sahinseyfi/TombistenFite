import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma, ReferralStatus } from "@prisma/client";
import {
  createReferralInvite,
  ReferralDuplicateEmailError,
} from "@/server/referrals/service";

const {
  userFindUniqueMock,
  userUpdateMock,
  referralInviteCreateMock,
  referralInviteUpdateMock,
  sendReferralInviteEmailMock,
  registerWaitlistOptInMock,
} = vi.hoisted(() => ({
  userFindUniqueMock: vi.fn(),
  userUpdateMock: vi.fn(),
  referralInviteCreateMock: vi.fn(),
  referralInviteUpdateMock: vi.fn(),
  sendReferralInviteEmailMock: vi.fn(),
  registerWaitlistOptInMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
    },
    referralInvite: {
      create: referralInviteCreateMock,
      update: referralInviteUpdateMock,
    },
  },
}));

vi.mock("@/server/emails/referrals", () => ({
  sendReferralInviteEmail: sendReferralInviteEmailMock,
}));

vi.mock("@/server/referrals/waitlist", () => ({
  registerWaitlistOptIn: registerWaitlistOptInMock,
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
  acceptedAt: null,
  canceledAt: null,
  createdAt: new Date("2025-10-10T10:00:00.000Z"),
  updatedAt: new Date("2025-10-10T10:00:00.000Z"),
};

beforeEach(() => {
  userFindUniqueMock.mockReset();
  userUpdateMock.mockReset();
  referralInviteCreateMock.mockReset();
  referralInviteUpdateMock.mockReset();
  sendReferralInviteEmailMock.mockReset();
  registerWaitlistOptInMock.mockReset();

  // Varsayilan davet kodu ve kullanici bilgileri.
  userFindUniqueMock
    .mockResolvedValueOnce({ referralCode: "INVITER01" }) // ensureReferralCode ilk sorgu
    .mockResolvedValueOnce({ id: "user-1", name: "Ayse Fit", handle: "aysefit" }); // createReferralInvite icin

  referralInviteCreateMock.mockResolvedValue(baseInvite);
  referralInviteUpdateMock.mockResolvedValue(baseInvite);
  sendReferralInviteEmailMock.mockResolvedValue({ sent: true, messageId: "msg_1" });
  registerWaitlistOptInMock.mockResolvedValue({ registered: true, contactId: "contact-1" });
});

describe("createReferralInvite", () => {
  it("normalizes email and triggers transactional email delivery", async () => {
    await createReferralInvite({
      inviterId: "user-1",
      email: "Friend@example.com ",
      name: "  Friend User ",
      waitlistOptIn: true,
    });

    expect(referralInviteCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inviterId: "user-1",
        inviteeEmail: "friend@example.com",
        inviteeName: "Friend User",
        waitlistOptIn: true,
      }),
    });

    expect(sendReferralInviteEmailMock).toHaveBeenCalledWith({
      to: "friend@example.com",
      inviteeName: "Friend User",
      inviteCode: "CODE1234",
      shareUrl: "http://localhost:3000/davet?ref=INVITER01",
      inviterName: "Ayse Fit",
      inviterHandle: "aysefit",
      waitlistOptIn: true,
    });

    expect(referralInviteUpdateMock).toHaveBeenCalledWith({
      where: { id: "invite-1" },
      data: expect.objectContaining({
        inviteEmailSentAt: expect.any(Date),
        inviteEmailProviderId: "msg_1",
      }),
    });

    expect(registerWaitlistOptInMock).toHaveBeenCalledWith(baseInvite, {
      inviterId: "user-1",
      inviterHandle: "aysefit",
      inviterName: "Ayse Fit",
      referralCode: "INVITER01",
    });
  });

  it("throws ReferralDuplicateEmailError when unique constraint fails", async () => {
    const duplicateError = new Prisma.PrismaClientKnownRequestError("Unique violation", {
      code: "P2002",
      clientVersion: "5.22.0",
      meta: { target: ["invitee_email"] },
    });

    referralInviteCreateMock.mockRejectedValueOnce(duplicateError);

    await expect(
      createReferralInvite({
        inviterId: "user-1",
        email: "friend@example.com",
      }),
    ).rejects.toBeInstanceOf(ReferralDuplicateEmailError);

    expect(sendReferralInviteEmailMock).not.toHaveBeenCalled();
    expect(registerWaitlistOptInMock).not.toHaveBeenCalled();
  });
});
