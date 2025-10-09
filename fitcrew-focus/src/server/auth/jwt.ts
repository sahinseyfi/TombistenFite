import { sign, type SignOptions, verify } from "jsonwebtoken";
import ms, { type StringValue } from "ms";
import { env } from "@/env";

type CommonClaims = {
  sub: string;
  handle: string;
  name: string;
};

export type AccessTokenClaims = CommonClaims & {
  type: "access";
};

export type RefreshTokenClaims = CommonClaims & {
  type: "refresh";
};

export type AuthTokens = {
  tokenType: "Bearer";
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

const secret: string = env.JWT_SECRET;
const accessExpiresMs = ms(env.JWT_ACCESS_EXPIRY as StringValue);
const refreshExpiresMs = ms(env.JWT_REFRESH_EXPIRY as StringValue);

if (typeof accessExpiresMs !== "number" || Number.isNaN(accessExpiresMs)) {
  throw new Error("JWT_ACCESS_EXPIRY değeri parse edilemedi.");
}

if (typeof refreshExpiresMs !== "number" || Number.isNaN(refreshExpiresMs)) {
  throw new Error("JWT_REFRESH_EXPIRY değeri parse edilemedi.");
}

export function signAccessToken(payload: CommonClaims): { token: string; expiresAt: string } {
  const token = sign(
    { ...payload, type: "access" },
    secret,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as SignOptions,
  );
  return {
    token,
    expiresAt: new Date(Date.now() + accessExpiresMs).toISOString(),
  };
}

export function signRefreshToken(payload: CommonClaims): { token: string; expiresAt: string } {
  const token = sign(
    { ...payload, type: "refresh" },
    secret,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as SignOptions,
  );
  return {
    token,
    expiresAt: new Date(Date.now() + refreshExpiresMs).toISOString(),
  };
}

export function generateAuthTokens(payload: CommonClaims): AuthTokens {
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  return {
    tokenType: "Bearer",
    accessToken: access.token,
    accessTokenExpiresAt: access.expiresAt,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded = verify(token, secret) as AccessTokenClaims;
  if (decoded.type !== "access") {
    throw new Error("Token tipi geçersiz");
  }

  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  const decoded = verify(token, secret) as RefreshTokenClaims;
  if (decoded.type !== "refresh") {
    throw new Error("Token tipi geçersiz");
  }

  return decoded;
}
