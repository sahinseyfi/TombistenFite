import type { ReferralInvite, ReferralStatus } from "@prisma/client";

function mapStatus(status: ReferralStatus) {
  switch (status) {
    case "ACCEPTED":
      return "accepted";
    case "CANCELED":
      return "canceled";
    default:
      return "pending";
  }
}

export function serializeReferralInvite(invite: ReferralInvite) {
  return {
    id: invite.id,
    inviterId: invite.inviterId,
    inviteeEmail: invite.inviteeEmail,
    inviteeName: invite.inviteeName ?? undefined,
    inviteCode: invite.inviteCode,
    status: mapStatus(invite.status),
    inviteeUserId: invite.inviteeUserId ?? undefined,
    waitlistOptIn: invite.waitlistOptIn,
    waitlistProvider: invite.waitlistProvider ?? undefined,
    waitlistSubscriberId: invite.waitlistSubscriberId ?? undefined,
    waitlistSubscribedAt: invite.waitlistSubscribedAt?.toISOString(),
    inviteEmailSentAt: invite.inviteEmailSentAt?.toISOString(),
    inviteEmailProviderId: invite.inviteEmailProviderId ?? undefined,
    acceptedAt: invite.acceptedAt?.toISOString(),
    canceledAt: invite.canceledAt?.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    updatedAt: invite.updatedAt.toISOString(),
  };
}

export type SerializedReferralInvite = ReturnType<typeof serializeReferralInvite>;
