import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

type ErrorPayload = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(payload: ErrorPayload, status = 400) {
  return NextResponse.json(
    {
      error: {
        ...payload,
        traceId: randomUUID(),
      },
    },
    { status },
  );
}
