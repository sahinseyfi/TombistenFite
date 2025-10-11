import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { normalizeHandle } from "@/server/auth/utils";

export function buildUserIdentifierWhere(identifier: string): Prisma.UserWhereInput {
  if (identifier.startsWith("@")) {
    const normalized = normalizeHandle(identifier);
    return {
      OR: [{ handle: normalized }, { handle: normalized.slice(1) }],
    };
  }

  return { id: identifier };
}

export async function findUserByIdentifier<T extends Prisma.UserSelect>(
  identifier: string,
  select: T,
) {
  return prisma.user.findFirst({
    where: buildUserIdentifierWhere(identifier),
    select,
  });
}
