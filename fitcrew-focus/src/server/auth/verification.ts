import { randomBytes } from "node:crypto";
import { addMinutes, isBefore } from "date-fns";
import { Prisma, VerificationTokenType } from "@prisma/client";
import { prisma } from "@/server/db";

type CreateTokenOptions = {
  userId: string;
  type: VerificationTokenType;
  expiresInMinutes?: number;
};

type VerificationTokenRecord = Prisma.VerificationTokenUncheckedCreateInput;

const DEFAULT_EXPIRY_MINUTES: Record<VerificationTokenType, number> = {
  EMAIL_VERIFICATION: 60 * 24,
  PASSWORD_RESET: 30,
};

function generateToken() {
  return randomBytes(32).toString("hex");
}

export async function createVerificationToken(
  options: CreateTokenOptions,
): Promise<{ token: string; expiresAt: Date }> {
  const expiresInMinutes = options.expiresInMinutes ?? DEFAULT_EXPIRY_MINUTES[options.type];
  const expiresAt = addMinutes(new Date(), expiresInMinutes);
  const token = generateToken();

  const record: VerificationTokenRecord = {
    userId: options.userId,
    token,
    type: options.type,
    expiresAt,
  };

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: {
        userId: options.userId,
        type: options.type,
        OR: [
          { consumedAt: { not: null } },
          { expiresAt: { lt: new Date() } },
        ],
      },
    }),
    prisma.verificationToken.create({
      data: record,
    }),
  ]);

  return { token, expiresAt };
}

type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "already_consumed" };

export async function consumeVerificationToken(token: string, type: VerificationTokenType): Promise<ConsumeResult> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
    select: {
      id: true,
      userId: true,
      type: true,
      expiresAt: true,
      consumedAt: true,
    },
  });

  if (!record || record.type !== type) {
    return { ok: false, reason: "not_found" };
  }

  if (record.consumedAt) {
    return { ok: false, reason: "already_consumed" };
  }

  if (isBefore(record.expiresAt, new Date())) {
    return { ok: false, reason: "expired" };
  }

  await prisma.verificationToken.update({
    where: { token },
    data: {
      consumedAt: new Date(),
    },
  });

  return { ok: true, userId: record.userId };
}
