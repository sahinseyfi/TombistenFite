import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __prisma__client: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__client ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma__client = prisma;
}
