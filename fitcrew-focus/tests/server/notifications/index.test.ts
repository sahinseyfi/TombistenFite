import { describe, it, expect, beforeEach, vi } from "vitest";

const {
  userFindUniqueMock,
  postFindUniqueMock,
  commentFindUniqueMock,
  notificationCreateManyMock,
  notificationCountMock,
  redisGetMock,
  redisSetMock,
  redisDelMock,
  getRedisClientMock,
} = vi.hoisted(() => {
  const redisStub = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  };

  return {
    userFindUniqueMock: vi.fn(),
    postFindUniqueMock: vi.fn(),
    commentFindUniqueMock: vi.fn(),
    notificationCreateManyMock: vi.fn(),
    notificationCountMock: vi.fn(),
    redisGetMock: redisStub.get,
    redisSetMock: redisStub.set,
    redisDelMock: redisStub.del,
    getRedisClientMock: vi.fn(() => redisStub),
  };
});

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: userFindUniqueMock,
    },
    post: {
      findUnique: postFindUniqueMock,
    },
    comment: {
      findUnique: commentFindUniqueMock,
    },
    notification: {
      createMany: notificationCreateManyMock,
      count: notificationCountMock,
    },
  },
}));

vi.mock("@/server/redis", () => ({
  getRedisClient: getRedisClientMock,
}));

import {
  queueNotificationsForEvent,
  getUnreadCount,
  invalidateUnreadCount,
} from "@/server/notifications";

describe("queueNotificationsForEvent", () => {
  beforeEach(() => {
    userFindUniqueMock.mockReset();
    postFindUniqueMock.mockReset();
    commentFindUniqueMock.mockReset();
    notificationCreateManyMock.mockReset();
    redisDelMock.mockReset();
  });

  it("post begenisi icin bildirim olusturup cache'i temizler", async () => {
    userFindUniqueMock.mockResolvedValueOnce({
      id: "actor-1",
      handle: "actor",
      name: "Actor",
      avatarUrl: null,
    });
    postFindUniqueMock.mockResolvedValueOnce({
      id: "post-1",
      authorId: "owner-1",
      photos: ["https://cdn.local/post.jpg"],
    });
    notificationCreateManyMock.mockResolvedValueOnce({ count: 1 });

    const result = await queueNotificationsForEvent({
      kind: "post_like",
      actorId: "actor-1",
      postId: "post-1",
    });

    expect(result).toEqual({ created: 1 });
    expect(notificationCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: "owner-1",
          type: "LIKE",
        }),
      ],
    });
    expect(redisDelMock).toHaveBeenCalledWith(expect.stringContaining("owner-1"));
  });

  it("kendi gonderisini begenen kullanicida bildirim olusturmaz", async () => {
    userFindUniqueMock.mockResolvedValueOnce({
      id: "actor-1",
      handle: "actor",
      name: "Actor",
      avatarUrl: null,
    });
    postFindUniqueMock.mockResolvedValueOnce({
      id: "post-1",
      authorId: "actor-1",
      photos: [],
    });

    const result = await queueNotificationsForEvent({
      kind: "post_like",
      actorId: "actor-1",
      postId: "post-1",
    });

    expect(result).toEqual({ created: 0 });
    expect(notificationCreateManyMock).not.toHaveBeenCalled();
  });
});

describe("getUnreadCount", () => {
  beforeEach(() => {
    notificationCountMock.mockReset();
    redisGetMock.mockReset();
    redisSetMock.mockReset();
  });

  it("cache hit durumunda veritabanina gitmez", async () => {
    redisGetMock.mockResolvedValueOnce("7");

    const count = await getUnreadCount("user-1");

    expect(count).toBe(7);
    expect(notificationCountMock).not.toHaveBeenCalled();
  });

  it("cache miss durumunda veritabanini kullanip cache'i gunceller", async () => {
    redisGetMock.mockResolvedValueOnce(null);
    notificationCountMock.mockResolvedValueOnce(3);

    const count = await getUnreadCount("user-1");

    expect(count).toBe(3);
    expect(notificationCountMock).toHaveBeenCalledWith({
      where: { userId: "user-1", readAt: null },
    });
    expect(redisSetMock).toHaveBeenCalledWith(expect.stringContaining("user-1"), "3", "EX", expect.any(Number));
  });

  it("gecersiz userId icin 0 dondurur", async () => {
    const count = await getUnreadCount("");

    expect(count).toBe(0);
    expect(notificationCountMock).not.toHaveBeenCalled();
  });
});

describe("invalidateUnreadCount", () => {
  beforeEach(() => {
    redisDelMock.mockReset();
  });

  it("redis anahtarini temizler", async () => {
    await invalidateUnreadCount("user-42");

    expect(redisDelMock).toHaveBeenCalledWith(expect.stringContaining("user-42"));
  });
});
