import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, userFindUniqueMock, measurementFindFirstMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  measurementFindFirstMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
    measurement: {
      findFirst: measurementFindFirstMock,
    },
  },
}));

import { GET } from "@/app/api/profile/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

function createUser() {
  return {
    id: "user-1",
    email: "user@example.com",
    handle: "userhandle",
    name: "Test User",
    avatarUrl: "https://cdn.fitcrew.local/u1.png",
    bio: null,
    phone: null,
    referralCode: "CODE1234",
    defaultVisibility: "PUBLIC",
    aiCommentDefault: true,
    createdAt: new Date("2025-10-10T10:00:00.000Z"),
    updatedAt: new Date("2025-10-10T10:00:00.000Z"),
    deletedAt: null,
    passwordHash: "hashed",
    emailVerifiedAt: null,
    _count: {
      posts: 4,
      followers: 12,
      following: 8,
    },
  };
}

function createMeasurement() {
  return {
    id: "measurement-1",
    userId: "user-1",
    date: new Date("2025-10-09T08:00:00.000Z"),
    weightKg: 68.4,
    waistCm: 72.3,
    chestCm: null,
    hipCm: null,
    armCm: null,
    thighCm: null,
    createdAt: new Date("2025-10-09T08:00:00.000Z"),
  };
}

describe("/api/profile", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    userFindUniqueMock.mockReset();
    measurementFindFirstMock.mockReset();
  });

  it("returns 401 when the user is not authenticated", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/profile"));

    expect(response.status).toBe(401);
    expect(userFindUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when user record is missing", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    userFindUniqueMock.mockResolvedValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/profile"));

    expect(response.status).toBe(404);
    expect(measurementFindFirstMock).toHaveBeenCalledTimes(1);
  });

  it("returns serialized profile overview", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "user-1" });
    userFindUniqueMock.mockResolvedValueOnce(createUser());
    measurementFindFirstMock.mockResolvedValueOnce(createMeasurement());

    const response = await GET(buildRequest("https://app.local/api/profile"));

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.user.id).toBe("user-1");
    expect(body.user.stats).toEqual({ posts: 4, followers: 12, following: 8 });
    expect(body.latestMeasurement.id).toBe("measurement-1");
    expect(body.latestMeasurement.weightKg).toBeCloseTo(68.4);
  });
});
