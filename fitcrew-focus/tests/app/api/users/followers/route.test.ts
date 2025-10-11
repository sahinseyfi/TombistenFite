import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  authenticateMock,
  findUserMock,
  followFindUniqueMock,
  followFindManyMock,
} = vi.hoisted(() => ({
  authenticateMock: vi.fn(),
  findUserMock: vi.fn(),
  followFindUniqueMock: vi.fn(),
  followFindManyMock: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

vi.mock("@/server/users/utils", () => ({
  findUserByIdentifier: findUserMock,
}));

vi.mock("@/server/db", () => ({
  prisma: {
    follow: {
      findUnique: followFindUniqueMock,
      findMany: followFindManyMock,
    },
  },
}));

import { GET as getFollowers } from "@/app/api/users/[id]/followers/route";
import { GET as getFollowing } from "@/app/api/users/[id]/following/route";

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
      posts: 5,
      followers: 10,
      following: 3,
    },
  };
}

describe("GET /api/users/[id]/followers", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    findUserMock.mockReset();
    followFindUniqueMock.mockReset();
    followFindManyMock.mockReset();
  });

  it("oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await getFollowers(buildRequest("https://app.local/api/users/u1/followers"), {
      params: { id: "u1" },
    } as any);

    expect(response.status).toBe(401);
  });

  it("gecersiz cursor icin 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });
    findUserMock.mockResolvedValueOnce({ id: "target-1" });
    followFindUniqueMock.mockResolvedValueOnce(null);

    const response = await getFollowers(
      buildRequest("https://app.local/api/users/target-1/followers?cursor=follower-x"),
      { params: { id: "target-1" } } as any,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
    expect(followFindManyMock).not.toHaveBeenCalled();
  });

  it("takipci listesini cursor ile dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });
    findUserMock.mockResolvedValueOnce({ id: "target-1" });
    followFindManyMock.mockResolvedValueOnce([
      { followerId: "f1", follower: createUser("f1") },
      { followerId: "f2", follower: createUser("f2") },
      { followerId: "f3", follower: createUser("f3") },
      { followerId: "f4", follower: createUser("f4") },
      { followerId: "f5", follower: createUser("f5") },
      { followerId: "f6", follower: createUser("f6") },
    ]);

    const response = await getFollowers(
      buildRequest("https://app.local/api/users/target-1/followers?limit=5"),
      { params: { id: "target-1" } } as any,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.users).toHaveLength(5);
    expect(body.users[0].id).toBe("f1");
    expect(body.nextCursor).toBe("f6");

    expect(followFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { followeeId: "target-1", status: "ACCEPTED" },
        take: 6,
      }),
    );
  });
});

describe("GET /api/users/[id]/following", () => {
  beforeEach(() => {
    authenticateMock.mockReset();
    findUserMock.mockReset();
    followFindUniqueMock.mockReset();
    followFindManyMock.mockReset();
  });

  it("cursor dogrulanamazsa 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });
    findUserMock.mockResolvedValueOnce({ id: "viewer" });
    followFindUniqueMock.mockResolvedValueOnce(null);

    const response = await getFollowing(
      buildRequest("https://app.local/api/users/viewer/following?cursor=x1"),
      { params: { id: "viewer" } } as any,
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
  });

  it("takip edilenleri dondurur ve nextCursor saglar", async () => {
    authenticateMock.mockReturnValueOnce({ sub: "viewer" });
    findUserMock.mockResolvedValueOnce({ id: "viewer" });
    followFindManyMock.mockResolvedValueOnce([
      { followeeId: "t1", followee: createUser("t1") },
      { followeeId: "t2", followee: createUser("t2") },
      { followeeId: "t3", followee: createUser("t3") },
      { followeeId: "t4", followee: createUser("t4") },
      { followeeId: "t5", followee: createUser("t5") },
      { followeeId: "t6", followee: createUser("t6") },
    ]);

    const response = await getFollowing(
      buildRequest("https://app.local/api/users/viewer/following?limit=5"),
      { params: { id: "viewer" } } as any,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.users).toHaveLength(5);
    expect(body.users[0].id).toBe("t1");
    expect(body.nextCursor).toBe("t6");

    expect(followFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { followerId: "viewer", status: "ACCEPTED" },
        take: 6,
      }),
    );
  });
});
