import type { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenClaims } from "@/server/auth/jwt";

export type AuthContext = AccessTokenClaims;

export function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export function authenticate(request: NextRequest): AuthContext | null {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch (error) {
    console.error("Erişim token doğrulaması başarısız:", error);
    return null;
  }
}
