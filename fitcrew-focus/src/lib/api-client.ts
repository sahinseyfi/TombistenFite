import { cookies } from "next/headers";
import { env } from "@/env";

const ACCESS_TOKEN_COOKIE = "fitcrew_access_token";

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly cause?: unknown;

  constructor(status: number, payload: ApiErrorPayload = {}, cause?: unknown) {
    super(payload.message ?? `API hatası (${status})`);
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.cause = cause;
  }
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = env.APP_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildHeaders(init?: RequestInit, includeAuth = true) {
  const headers = new Headers(init?.headers ?? {});
  headers.set("accept", "application/json");

  if (includeAuth) {
    const token = cookies().get(ACCESS_TOKEN_COOKIE)?.value;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

export async function apiFetch<TResponse>(path: string, init: ApiFetchOptions = {}): Promise<TResponse> {
  const url = buildUrl(path);
  const { auth = true, ...requestInit } = init;

  const response = await fetch(url, {
    ...requestInit,
    headers: buildHeaders(init, auth),
    cache: init.cache ?? "no-store",
  });

  if (!response.ok) {
    let payload: ApiErrorPayload = {};
    try {
      const json = await response.json();
      payload = typeof json === "object" && json !== null ? (json.error ?? json) : {};
    } catch {
      // yoksay
    }
    throw new ApiError(response.status, payload);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as unknown as TResponse;
}

export function getAccessTokenFromCookies(): string | null {
  return cookies().get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
