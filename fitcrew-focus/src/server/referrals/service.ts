import { Prisma, ReferralStatus } from "@prisma/client";
import { prisma } from "@/server/db";

const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRAL_CODE_LENGTH = 8;

export class ReferralDuplicateEmailError extends Error {
  constructor() {
    super("Bu e-posta adresi icin zaten bir davet gonderilmis.");
    this.name = "ReferralDuplicateEmailError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateReferralCode(length = REFERRAL_CODE_LENGTH) {
  let result = "";
  const max = REFERRAL_CODE_ALPHABET.length;
  for (let i = 0; i < length; i += 1) {
    result += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * max)];
  }
  return result;
}

function isUniqueViolation(error: Prisma.PrismaClientKnownRequestError, keyword: string) {
  const target = error.meta?.target;
  if (!target) {
    return false;
  }

  if (typeof target === "string") {
    return target.includes(keyword);
  }

  if (Array.isArray(target)) {
    return target.some((item) => typeof item === "string" && item.includes(keyword));
  }

  return false;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (existing?.referralCode) {
    return existing.referralCode;
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = generateReferralCode();
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: { referralCode: true },
      });
      return updated.referralCode ?? code;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        isUniqueViolation(error, "referral_code")
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Benzersiz bir davet kodu olusturulamadi.");
}

type CreateReferralInviteInput = {
  inviterId: string;
  email: string;
  name?: string | null;
  waitlistOptIn?: boolean;
};

export async function createReferralInvite({
  inviterId,
  email,
  name,
  waitlistOptIn,
}: CreateReferralInviteInput) {
  const normalizedEmail = normalizeEmail(email);
  await ensureReferralCode(inviterId);

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const inviteCode = generateReferralCode();
    try {
      return await prisma.referralInvite.create({
        data: {
          inviterId,
          inviteeEmail: normalizedEmail,
          inviteeName: name?.trim() || null,
          inviteCode,
          waitlistOptIn: Boolean(waitlistOptIn),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        if (isUniqueViolation(error, "invitee_email")) {
          throw new ReferralDuplicateEmailError();
        }
        if (isUniqueViolation(error, "invite_code")) {
          continue;
        }
      }
      throw error;
    }
  }

  throw new Error("Davetiye kodu benzersizligi saglanamadi.");
}

export type ReferralSummary = {
  total: number;
  accepted: number;
  pending: number;
};

export async function listReferralInvites(inviterId: string) {
  return prisma.referralInvite.findMany({
    where: { inviterId },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getReferralDashboard(userId: string) {
  const code = await ensureReferralCode(userId);
  const invites = await listReferralInvites(userId);

  const summary: ReferralSummary = invites.reduce(
    (acc, invite) => {
      acc.total += 1;
      if (invite.status === ReferralStatus.ACCEPTED) {
        acc.accepted += 1;
      } else if (invite.status === ReferralStatus.PENDING) {
        acc.pending += 1;
      }
      return acc;
    },
    { total: 0, accepted: 0, pending: 0 } as ReferralSummary,
  );

  return {
    code,
    invites,
    summary,
  };
}
