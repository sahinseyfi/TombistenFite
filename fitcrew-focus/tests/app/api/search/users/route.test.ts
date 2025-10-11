import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateMock, userFindManyMock } = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  userFindManyMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findMany: userFindManyMock,
    },
  },
}));

import { GET } from "@/app/api/search/users/route";

type NextRequestCtorInit = ConstructorParameters<typeof NextRequest>[1];

function buildRequest(url: string, init?: NextRequestCtorInit) {
  return new NextRequest(url, init);
}

function createUser(id: string) {
  const createdAt = new Date("2025-10-10T12:00:00.000Z");
  return {
    id,
    handle: `@${id}`,
    name: `User ${id}`,
    email: null,
    phone: null,
    avatarUrl: null,
    bio: null,
    defaultVisibility: "PUBLIC",
    aiCommentDefault: true,
    createdAt,
    updatedAt: createdAt,
    _count: {
      posts: 0,
      followers: 0,
      following: 0,
    },
  };
}

describe("GET /api/search/users", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    userFindManyMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/search/users?q=ay"));

    expect(response.status).toBe(401);
  });

  it("kisa sorgu icin 422 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });

    const response = await GET(buildRequest("https://app.local/api/search/users?q=a"));

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
    expect(userFindManyMock).not.toHaveBeenCalled();
  });

  it("arama sonucunu serializeUser ile dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });
    userFindManyMock.mockResolvedValueOnce([createUser("ayse"), createUser("mert")]);

    const response = await GET(buildRequest("https://app.local/api/search/users?q=ayse&limit=5"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.users).toHaveLength(2);
    expect(body.users[0]).toMatchObject({ id: "ayse", handle: "@ayse" });

    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 5,
      }),
    );
  });
});
