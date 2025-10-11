import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type ErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

type HeadersLike = Headers | Record<string, string> | Array<[string, string]>;

type SuccessOptions =
  | number
  | {
      status?: number;
      request?: NextRequest;
      headers?: HeadersLike;
      etag?: string;
    };

type ErrorOptions =
  | number
  | {
      status?: number;
      headers?: HeadersLike;
    };

function toHeaders(input?: HeadersLike) {
  const headers = new Headers();
  if (!input) {
    return headers;
  }

  if (input instanceof Headers) {
    input.forEach((value, key) => {
      headers.set(key, value);
    });
    return headers;
  }

  if (Array.isArray(input)) {
    input.forEach(([key, value]) => {
      headers.set(key, value);
    });
    return headers;
  }

  Object.entries(input).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}

function shouldApplyEtag(status: number, request: NextRequest | undefined) {
  if (!request) {
    return false;
  }
  if (request.method !== "GET") {
    return false;
  }
  return status >= 200 && status < 300;
}

function computeEtag(serialized: string) {
  return `"${createHash("sha1").update(serialized).digest("base64url")}"`;
}

export function jsonSuccess<T>(data: T, options?: SuccessOptions) {
  const opts = typeof options === "number" ? { status: options } : options ?? {};
  const status = opts.status ?? 200;
  const headers = toHeaders(opts.headers);

  if (shouldApplyEtag(status, opts.request)) {
    const serialized = JSON.stringify(data);
    const etag = opts.etag ?? computeEtag(serialized);
    headers.set("ETag", etag);

    const incomingEtag = opts.request?.headers.get("if-none-match");
    if (incomingEtag && incomingEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers,
      });
    }
  }

  return NextResponse.json(data, {
    status,
    headers,
  });
}

export function jsonError(payload: ErrorPayload, options?: ErrorOptions) {
  const opts = typeof options === "number" ? { status: options } : options ?? {};
  const status = opts.status ?? 400;
  const headers = toHeaders(opts.headers);
  const traceId = randomUUID();
  headers.set("X-Trace-Id", traceId);

  return NextResponse.json(
    {
      error: {
        ...payload,
        traceId,
      },
    },
    {
      status,
      headers,
    },
  );
}
