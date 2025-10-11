import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  measurementFindManyMock,
  measurementFindFirstMock,
  measurementCreateMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  measurementFindManyMock: vi.fn(),
  measurementFindFirstMock: vi.fn(),
  measurementCreateMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    measurement: {
      findMany: measurementFindManyMock,
      findFirst: measurementFindFirstMock,
      create: measurementCreateMock,
    },
  },
}));

import { GET, POST } from "@/app/api/measurements/route";

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

function createMeasurement(id: string, date = "2025-10-10T12:00:00.000Z") {
  return {
    id,
    userId: "viewer-1",
    date: new Date(date),
    weightKg: 75.4,
    waistCm: 80.2,
    chestCm: null,
    hipCm: null,
    armCm: null,
    thighCm: null,
    createdAt: new Date(date),
  };
}

describe("GET /api/measurements", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    measurementFindManyMock.mockReset();
    measurementFindFirstMock.mockReset();
    measurementCreateMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/measurements"));

    expect(response.status).toBe(401);
    expect(measurementFindManyMock).not.toHaveBeenCalled();
  });

  it("cursor dogrulanamazsa 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    measurementFindFirstMock.mockResolvedValueOnce(null);

    const response = await GET(
      buildRequest("https://app.local/api/measurements?cursor=clcursor0000000000000000000001"),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
    expect(measurementFindManyMock).not.toHaveBeenCalled();
  });

  it("olcumleri cursor bazli dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    measurementFindManyMock.mockResolvedValueOnce([
      createMeasurement("m1"),
      createMeasurement("m2"),
      createMeasurement("m3"),
      createMeasurement("m4"),
      createMeasurement("m5"),
      createMeasurement("m6"),
    ]);

    const response = await GET(buildRequest("https://app.local/api/measurements?limit=5"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.measurements).toHaveLength(5);
    expect(body.measurements[0].id).toBe("m1");
    expect(body.nextCursor).toBe("m6");

    expect(measurementFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "viewer-1" },
        take: 6,
      }),
    );
  });

  it("baska kullanici icin talep edilirse 403 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });

    const response = await GET(
      buildRequest("https://app.local/api/measurements?userId=cluser0000000000000000000002"),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("forbidden");
  });
});

describe("POST /api/measurements", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    measurementFindManyMock.mockReset();
    measurementFindFirstMock.mockReset();
    measurementCreateMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await POST(
      buildRequest("https://app.local/api/measurements", {
        method: "POST",
        body: JSON.stringify({ weightKg: 70 }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(401);
  });

  it("olcum degeri olmadan 422 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });

    const response = await POST(
      buildRequest("https://app.local/api/measurements", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(measurementCreateMock).not.toHaveBeenCalled();
  });

  it("olcum kaydi olusturur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer-1" });
    measurementCreateMock.mockResolvedValueOnce(createMeasurement("m100"));

    const response = await POST(
      buildRequest("https://app.local/api/measurements", {
        method: "POST",
        body: JSON.stringify({
          date: "2025-10-10T10:00:00.000Z",
          weightKg: 70.5,
          metrics: {
            waistCm: 80.2,
          },
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.measurement.id).toBe("m100");

    expect(measurementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "viewer-1",
        date: new Date("2025-10-10T10:00:00.000Z"),
      }),
    });
  });
});
